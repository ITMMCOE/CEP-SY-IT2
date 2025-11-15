from rest_framework import serializers
from .models import Product, InventoryBatch, Supplier, SupplierProduct, ProductDailySales, StockAlert, ProductStockSnapshot


class ProductSerializer(serializers.ModelSerializer):
    active_alerts_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Product
        fields = '__all__'


class SupplierSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_name', 'email', 'phone', 'address', 'notes',
            'is_active', 'created_at', 'updated_at', 'product_count'
        ]
        read_only_fields = ('created_at', 'updated_at', 'product_count')


class SupplierProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = SupplierProduct
        fields = [
            'id', 'supplier', 'supplier_name', 'product', 'product_name',
            'cost_price', 'lead_time_days', 'min_order_quantity', 'last_supplied_at',
            'is_preferred', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')


class InventoryBatchSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InventoryBatch
        fields = '__all__'


class ProductDailySalesSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductDailySales
        fields = ['id', 'product', 'product_name', 'date', 'quantity', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')


class StockAlertSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockAlert
        fields = [
            'id', 'product', 'product_name', 'status', 'active', 'created_at', 'resolved_at',
            'current_stock_at_trigger', 'minimum_stock_level', 'message'
        ]
        read_only_fields = (
            'created_at', 'resolved_at', 'current_stock_at_trigger', 'minimum_stock_level', 'message'
        )


class ProductStockSnapshotSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductStockSnapshot
        fields = ['id', 'product', 'product_name', 'date', 'stock_level', 'created_at']
        read_only_fields = ('created_at',)