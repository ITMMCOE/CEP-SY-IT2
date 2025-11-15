from django.core.management.base import BaseCommand
from inventory.models import Supplier, Product, SupplierProduct
from django.utils import timezone

SUPPLIERS = [
    {
        "name": "Acme Metals",
        "contact_name": "John Carter",
        "email": "sales@acmemetals.example",
        "phone": "+1-555-1000",
        "notes": "Primary steel supplier",
    },
    {
        "name": "Global Plastics Co",
        "contact_name": "Maria Diaz",
        "email": "orders@globalplastics.example",
        "phone": "+1-555-2000",
        "notes": "ABS and Polycarbonate",
    },
    {
        "name": "Timber Traders",
        "contact_name": "Liu Wei",
        "email": "support@timbertraders.example",
        "phone": "+1-555-3000",
        "notes": "Seasonal variations in lead time",
    },
]

class Command(BaseCommand):
    help = "Seed some example suppliers and link a few existing products"

    def handle(self, *args, **options):
        created_count = 0
        for data in SUPPLIERS:
            supplier, created = Supplier.objects.get_or_create(name=data["name"], defaults=data)
            if created:
                created_count += 1
        self.stdout.write(self.style.SUCCESS(f"Ensured {len(SUPPLIERS)} suppliers (created {created_count})."))

        products = list(Product.objects.all()[:5])
        if not products:
            self.stdout.write(self.style.WARNING("No products found to link; add products first."))
            return

        for supplier in Supplier.objects.all():
            for product in products:
                SupplierProduct.objects.get_or_create(
                    supplier=supplier,
                    product=product,
                    defaults={
                        "cost_price": 10.00,
                        "lead_time_days": 7,
                        "min_order_quantity": 10,
                        "last_supplied_at": timezone.now(),
                        "is_preferred": True,
                        "notes": "Seed data"
                    }
                )
        self.stdout.write(self.style.SUCCESS("Linked suppliers to sample products."))
