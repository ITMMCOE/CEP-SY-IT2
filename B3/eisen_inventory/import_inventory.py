import os
import django
import csv
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eisen_inventory.settings')
django.setup()

from inventory.models import Product, InventoryBatch

# Path to your CSV file
csv_path = 'inventory.csv'

with open(csv_path, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        sku = row['PRODUCT ID'].strip()
        name = row['PRODUCT NAME'].strip()
        current_stock = int(row['PRODUCTS IN STOCK'])
        min_stock = 15 if 'NEEDS' in row['RESTOCK'].upper() else 5

        # Create or update product
        product, created = Product.objects.update_or_create(
            sku=sku,
            defaults={
                'name': name,
                'minimum_stock_level': min_stock,
                'current_stock': current_stock
            }
        )

        # Create a batch for the current stock (received now)
        # Only if current stock > 0
        if current_stock > 0:
            InventoryBatch.objects.create(
                product=product,
                quantity=current_stock,
                received_at=datetime.now()
            )

        print(f"{'Created' if created else 'Updated'} product: {name} ({sku}), Stock: {current_stock}")

print("Inventory import completed.")