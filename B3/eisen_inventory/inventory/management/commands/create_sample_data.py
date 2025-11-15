"""
Add sample data to test the inventory system
"""
from django.core.management.base import BaseCommand
from inventory.models import Product, Supplier, SupplierProduct, StockAlert
from django.utils import timezone


class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create suppliers
        suppliers = []
        supplier_names = [
            ('Acme Metals Inc.', 'John Doe', 'john@acmemetals.com', '+1-555-0100'),
            ('Global Supplies Ltd', 'Jane Smith', 'jane@globalsupplies.com', '+1-555-0200'),
            ('TechParts Corp', 'Bob Johnson', 'bob@techparts.com', '+1-555-0300'),
        ]
        
        for name, contact, email, phone in supplier_names:
            supplier, created = Supplier.objects.get_or_create(
                name=name,
                defaults={
                    'contact_name': contact,
                    'email': email,
                    'phone': phone
                }
            )
            suppliers.append(supplier)
            if created:
                self.stdout.write(f'  Created supplier: {name}')
        
        # Create products
        products = []
        product_data = [
            ('PROD-001', 'Steel Pipes 2"', 150, 50, 75, 25),
            ('PROD-002', 'Copper Wire Spool', 45, 100, 120, 40),
            ('PROD-003', 'Aluminum Sheets', 200, 80, 100, 30),
            ('PROD-004', 'Brass Fittings Set', 30, 150, 180, 60),
            ('PROD-005', 'Stainless Bolts M10', 500, 200, 250, 80),
            ('PROD-006', 'PVC Pipes 1"', 20, 120, 150, 50),
            ('PROD-007', 'Rubber Gaskets', 80, 250, 300, 100),
            ('PROD-008', 'Metal Brackets', 110, 90, 120, 40),
            ('PROD-009', 'Welding Rods', 180, 60, 80, 25),
            ('PROD-010', 'Paint Thinner 5L', 65, 40, 50, 15),
        ]
        
        for sku, name, current, min_stock, reorder, safety in product_data:
            product, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': name,
                    'current_stock': current,
                    'minimum_stock_level': min_stock,
                }
            )
            products.append(product)
            if created:
                self.stdout.write(f'  Created product: {name} (Stock: {current})')
        
        # Create some stock alerts for low stock items
        low_stock_products = [p for p in products if p.current_stock < p.minimum_stock_level]
        for product in low_stock_products:
            alert, created = StockAlert.objects.get_or_create(
                product=product,
                status=Product.STATUS_LOW,
                active=True,
                defaults={
                    'message': f'Stock level ({product.current_stock}) is below minimum ({product.minimum_stock_level})',
                    'current_stock_at_trigger': product.current_stock,
                    'minimum_stock_level': product.minimum_stock_level,
                }
            )
            if created:
                self.stdout.write(f'  Created alert for: {product.name}')
        
        # Create supplier products
        for i, product in enumerate(products[:5]):
            supplier = suppliers[i % len(suppliers)]
            sp, created = SupplierProduct.objects.get_or_create(
                supplier=supplier,
                product=product,
                defaults={
                    'cost_price': 10.50 + (i * 2.25),
                    'lead_time_days': 7 + (i * 2),
                    'is_preferred': True
                }
            )
            if created:
                self.stdout.write(f'  Created supplier product: {supplier.name} -> {product.name}')
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created:'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(suppliers)} suppliers'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(products)} products'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(low_stock_products)} stock alerts'))
