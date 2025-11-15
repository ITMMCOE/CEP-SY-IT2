from django.urls import path, include
from rest_framework import routers
from .api_views import (
    ProductViewSet,
    InventoryBatchViewSet,
    SupplierViewSet,
    SupplierProductViewSet,
    ProductDailySalesViewSet,
    StockAlertViewSet,
    ProductStockSnapshotViewSet,
    UploadViewSet,
    upload_excel_view,
    upload_csv_view,
    list_users,
)
from .auth_views import login_view, logout_view, current_user_view, register_view

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'inventory-batches', InventoryBatchViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'supplier-products', SupplierProductViewSet)
router.register(r'product-daily-sales', ProductDailySalesViewSet)
router.register(r'stock-alerts', StockAlertViewSet, basename='stock-alert')
router.register(r'stock-snapshots', ProductStockSnapshotViewSet, basename='stock-snapshot')
router.register(r'uploads', UploadViewSet, basename='uploads')

urlpatterns = [
    path('', include(router.urls)),
    # Explicit upload endpoints (CSRF-exempt function views)
    path('uploads/upload_excel/', upload_excel_view, name='upload-excel'),
    path('uploads/upload_csv/', upload_csv_view, name='upload-csv'),
    # Authentication endpoints
    path('auth/login/', login_view, name='api-login'),
    path('auth/logout/', logout_view, name='api-logout'),
    path('auth/user/', current_user_view, name='api-current-user'),
    path('auth/register/', register_view, name='api-register'),
    # User management
    path('users/', list_users, name='api-list-users'),
]