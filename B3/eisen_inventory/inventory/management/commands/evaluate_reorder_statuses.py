from django.core.management.base import BaseCommand
from inventory.models import Product


class Command(BaseCommand):
    help = "Evaluate and update reorder_status for all products"

    def handle(self, *args, **options):
        updated = 0
        total = 0
        for product in Product.objects.all():
            total += 1
            old = product.reorder_status
            product.evaluate_reorder_status(save=True)
            if product.reorder_status != old:
                updated += 1
        self.stdout.write(self.style.SUCCESS(f"Evaluated {total} products. {updated} status changes."))