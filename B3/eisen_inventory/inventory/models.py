from django.db import models
from django.utils import timezone


class Product(models.Model):
    sku = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255, db_index=True)
    minimum_stock_level = models.PositiveIntegerField(default=0)
    current_stock = models.PositiveIntegerField(default=0)
    # Alert fields
    reorder_warning_buffer_pct = models.PositiveIntegerField(default=20, help_text="Percent above minimum to start warning")
    STATUS_OK = 'OK'
    STATUS_APPROACHING = 'APPROACHING'
    STATUS_LOW = 'LOW'
    REORDER_STATUS_CHOICES = [
        (STATUS_OK, 'OK'),
        (STATUS_APPROACHING, 'Approaching Minimum'),
        (STATUS_LOW, 'Below Minimum'),
    ]
    reorder_status = models.CharField(max_length=16, choices=REORDER_STATUS_CHOICES, default=STATUS_OK)
    reorder_status_changed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def save(self, *args, **kwargs):
        if not self.reorder_status_changed_at:
            self.reorder_status_changed_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def active_alerts_count(self):
        return self.stock_alerts.filter(active=True).count()



class Supplier(models.Model):
    """A company or individual we buy material (products) from."""

    name = models.CharField(max_length=150, unique=True, db_index=True)
    contact_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def product_count(self):
        # Count distinct products offered by this supplier
        return self.supplier_products.values('product_id').distinct().count()


class SupplierProduct(models.Model):
    """Through model describing what a supplier sells us and related commercial data."""

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="supplier_products")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="supplier_products")
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    lead_time_days = models.PositiveIntegerField(null=True, blank=True, help_text="Lead time in days")
    min_order_quantity = models.PositiveIntegerField(null=True, blank=True)
    last_supplied_at = models.DateTimeField(null=True, blank=True)
    is_preferred = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("supplier", "product")
        ordering = ["supplier__name", "product__name"]

    def __str__(self):
        return f"{self.supplier.name} -> {self.product.name}"


class InventoryBatch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    received_at = models.DateTimeField(auto_now_add=True)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="batches",
        help_text="Which supplier provided this batch (optional)"
    )
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Cost per unit for this batch")

    def __str__(self):
        supplier_part = f" from {self.supplier.name}" if self.supplier else ""
        return f"{self.product.name} batch: {self.quantity} units @ {self.received_at}{supplier_part}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        # After saving, update SupplierProduct linkage info (cost, last supply date)
        if self.supplier:
            try:
                sp, _ = SupplierProduct.objects.get_or_create(
                    supplier=self.supplier,
                    product=self.product,
                    defaults={
                        'cost_price': self.unit_cost,
                        'last_supplied_at': self.received_at,
                        'is_preferred': True,
                    }
                )
                # Update if existing batch gives newer info
                updated = False
                if self.unit_cost is not None and self.unit_cost != sp.cost_price:
                    sp.cost_price = self.unit_cost
                    updated = True
                # Only update last_supplied_at if this is a new batch or newer timestamp
                if is_new and (sp.last_supplied_at is None or self.received_at > sp.last_supplied_at):
                    sp.last_supplied_at = self.received_at
                    updated = True
                if updated:
                    sp.save(update_fields=['cost_price', 'last_supplied_at'])
            except Exception:
                # Fail silently so inventory save isn't blocked; in production you may log this.
                pass
        # Evaluate alert status after stock change
        try:
            from .utils import evaluate_product_alert
            evaluate_product_alert(self.product, save=True)
        except Exception:
            pass


class ProductDailySales(models.Model):
    """Aggregate of outbound usage/sales per product per day to drive forecasting and reorder calculations."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='daily_sales')
    date = models.DateField()
    quantity = models.PositiveIntegerField(default=0, help_text="Units sold/used on this day")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("product", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.product.name} sales {self.date}: {self.quantity}"


class StockAlert(models.Model):
    """Historical and active alerts when product stock goes below or near minimum."""
    STATUS_CHOICES = [
        (Product.STATUS_APPROACHING, 'Approaching Minimum'),
        (Product.STATUS_LOW, 'Below Minimum'),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_alerts')
    status = models.CharField(max_length=16, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True, db_index=True)
    current_stock_at_trigger = models.PositiveIntegerField()
    minimum_stock_level = models.PositiveIntegerField()
    message = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['active']),
            models.Index(fields=['status']),
        ]

    def resolve(self, save=True):
        if self.active:
            self.active = False
            self.resolved_at = timezone.now()
            if save:
                self.save(update_fields=['active', 'resolved_at'])
        return self

    def __str__(self):
        return f"Alert {self.product.sku} {self.status} ({'active' if self.active else 'resolved'})"


class ProductStockSnapshot(models.Model):
    """End-of-day (or point-in-time) stock level snapshot for reporting & charting."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_snapshots')
    date = models.DateField()
    stock_level = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("product", "date")
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["product", "date"]),
        ]

    def __str__(self):
        return f"{self.product.sku} {self.date} -> {self.stock_level}"