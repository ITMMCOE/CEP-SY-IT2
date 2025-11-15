from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from inventory.models import Product, ProductDailySales, SupplierProduct

class Command(BaseCommand):
    help = "Seed synthetic daily sales/usage history for products to test reorder calculations"

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=120, help='How many days back to generate')

    def handle(self, *args, **options):
        days = options['days']
        today = timezone.now().date()
        products = list(Product.objects.all())
        if not products:
            self.stdout.write(self.style.ERROR('No products present. Add products first.'))
            return

        created = 0
        for product in products:
            base = random.randint(2, 8)  # base daily demand
            for i in range(days):
                d = today - timedelta(days=i)
                # Simulate some variability & occasional spikes
                qty = max(0, int(random.gauss(base, base * 0.3)))
                if random.random() < 0.05:
                    qty += base * 3  # spike day
                obj, was_created = ProductDailySales.objects.get_or_create(product=product, date=d, defaults={'quantity': qty})
                if not was_created:
                    # Don't overwrite existing curated data
                    continue
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Created {created} daily sales records.'))

        # Derive some lead times if missing
        for sp in SupplierProduct.objects.filter(lead_time_days__isnull=True):
            sp.lead_time_days = random.choice([3,5,7,10,14])
            sp.save(update_fields=['lead_time_days'])
        self.stdout.write(self.style.SUCCESS('Ensured lead times for supplier products.'))
