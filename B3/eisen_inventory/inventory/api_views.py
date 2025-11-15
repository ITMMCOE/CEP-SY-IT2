from rest_framework import viewsets, filters, decorators, response, status
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Prefetch
from django.http import JsonResponse
from django.contrib.auth.models import User
import tempfile, os
from .models import Product, InventoryBatch, Supplier, SupplierProduct, ProductDailySales, StockAlert, ProductStockSnapshot
from .serializers import (
    ProductSerializer,
    InventoryBatchSerializer,
    SupplierSerializer,
    SupplierProductSerializer,
    ProductDailySalesSerializer,
    StockAlertSerializer,
    ProductStockSnapshotSerializer,
)
from .utils import evaluate_product_alert, evaluate_all_alerts
from .utils import convert_excel_to_csv, import_inventory_csv


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'sku']

    @decorators.action(detail=True, methods=['post'])
    def evaluate_alert(self, request, pk=None):
        product = self.get_object()
        status = evaluate_product_alert(product, save=True)
        alerts = StockAlert.objects.filter(product=product).order_by('-created_at')[:5]
        return response.Response({
            'product_id': product.id,
            'status': status,
            'recent_alerts': StockAlertSerializer(alerts, many=True).data
        })

    @decorators.action(detail=True, methods=['post'])
    def resolve_alerts(self, request, pk=None):
        product = self.get_object()
        from django.utils import timezone
        count = StockAlert.objects.filter(product=product, active=True).update(active=False, resolved_at=timezone.now())
        return response.Response({'resolved_count': count})

    @decorators.action(detail=True, methods=['get'])
    def alerts(self, request, pk=None):
        product = self.get_object()
        qs = product.stock_alerts.all()
        return response.Response(StockAlertSerializer(qs, many=True).data)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('name')
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_name', 'email']


class SupplierProductViewSet(viewsets.ModelViewSet):
    queryset = SupplierProduct.objects.select_related('supplier', 'product').all()
    serializer_class = SupplierProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['supplier__name', 'product__name', 'product__sku']


class InventoryBatchViewSet(viewsets.ModelViewSet):
    queryset = InventoryBatch.objects.select_related('product', 'supplier').all().order_by('-received_at')
    serializer_class = InventoryBatchSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'product__sku', 'supplier__name']


class ProductDailySalesViewSet(viewsets.ModelViewSet):
    queryset = ProductDailySales.objects.select_related('product').all()
    serializer_class = ProductDailySalesSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'product__sku']


class StockAlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockAlert.objects.select_related('product').all()
    serializer_class = StockAlertSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'product__sku', 'status']

    @decorators.action(detail=False, methods=['post'])
    def evaluate(self, request):
        results = evaluate_all_alerts()
        return response.Response({'evaluated': len(results), 'results': results})

    @decorators.action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.resolve()
        return response.Response({'id': alert.id, 'resolved': True})


class ProductStockSnapshotViewSet(viewsets.ModelViewSet):
    queryset = ProductStockSnapshot.objects.select_related('product').all()
    serializer_class = ProductStockSnapshotSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['product__name', 'product__sku']

    @decorators.action(detail=False, methods=['get'])
    def product_daily(self, request):
        product_id = request.query_params.get('product')
        if not product_id:
            return response.Response({'detail': 'product query param required'}, status=400)
        qs = ProductStockSnapshot.objects.filter(product_id=product_id).order_by('-date')[:90]
        return response.Response(ProductStockSnapshotSerializer(qs, many=True).data)

    @decorators.action(detail=False, methods=['get'])
    def monthly(self, request):
        """Return monthly average, min, max stock for each product or a single product."""
        from django.db.models import Avg, Min, Max
        product_id = request.query_params.get('product')
        qs = ProductStockSnapshot.objects.all()
        if product_id:
            qs = qs.filter(product_id=product_id)
        # Annotate by product+month
        from django.db.models.functions import TruncMonth
        agg = (
            qs.annotate(month=TruncMonth('date'))
              .values('product_id', 'product__name', 'month')
              .annotate(avg_stock=Avg('stock_level'), min_stock=Min('stock_level'), max_stock=Max('stock_level'))
              .order_by('product__name', 'month')
        )
        return response.Response(list(agg))

    @decorators.action(detail=False, methods=['get'])
    def yearly(self, request):
        from django.db.models import Avg, Min, Max
        from django.db.models.functions import TruncYear
        product_id = request.query_params.get('product')
        qs = ProductStockSnapshot.objects.all()
        if product_id:
            qs = qs.filter(product_id=product_id)
        agg = (
            qs.annotate(year=TruncYear('date'))
              .values('product_id', 'product__name', 'year')
              .annotate(avg_stock=Avg('stock_level'), min_stock=Min('stock_level'), max_stock=Max('stock_level'))
              .order_by('product__name', 'year')
        )
        return response.Response(list(agg))


class UploadViewSet(viewsets.ViewSet):
    """Keep the original ViewSet in case the router is used elsewhere."""
    parser_classes = (MultiPartParser, FormParser)


# Add explicit function-based endpoints that are CSRF-exempt and easier to call from the
# frontend. These will be mapped in `inventory/urls.py` to override or supplement the
# ViewSet action endpoints and avoid CSRF/dispatch issues during development.
@csrf_exempt
def upload_excel_view(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'detail': 'file is required'}, status=400)
    mode = request.POST.get('mode', 'append')
    if mode not in ('append', 'replace_all'):
        mode = 'append'
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        for chunk in file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name
    try:
        csv_path = convert_excel_to_csv(tmp_path)
        result = import_inventory_csv(csv_path, mode=mode)
        return JsonResponse({'import_result': result})
    except Exception as e:
        import traceback
        print(f"Upload Excel Error: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'detail': str(e), 'message': str(e)}, status=400)
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


@csrf_exempt
def upload_csv_view(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'detail': 'file is required'}, status=400)
    mode = request.POST.get('mode', 'append')
    if mode not in ('append', 'replace_all'):
        mode = 'append'
    with tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='wb') as tmp:
        for chunk in file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name
    try:
        result = import_inventory_csv(tmp_path, mode=mode)
        return JsonResponse({'import_result': result})
    except Exception as e:
        import traceback
        print(f"Upload CSV Error: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'detail': str(e), 'message': str(e)}, status=400)
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


@decorators.api_view(['GET'])
@decorators.permission_classes([])
def list_users(request):
    """List all users with their details"""
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'detail': 'Not authorized'}, status=403)
    
    users = User.objects.all().prefetch_related('groups', 'user_permissions')
    users_data = []
    
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'groups': [g.name for g in user.groups.all()],
            'user_permissions': [p.codename for p in user.user_permissions.all()],
            'date_joined': user.date_joined,
            'last_login': user.last_login,
        })
    
    return JsonResponse(users_data, safe=False)