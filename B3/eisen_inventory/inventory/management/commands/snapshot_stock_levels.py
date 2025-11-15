from django.core.management.base import BaseCommand
from inventory.utils import create_daily_stock_snapshots


class Command(BaseCommand):
    help = "Create daily stock level snapshots for all products (idempotent per date)"

    def add_arguments(self, parser):
        parser.add_argument('--date', help='YYYY-MM-DD (defaults to today)', default=None)

    def handle(self, *args, **options):
        date = options.get('date')
        if date:
            from datetime import date as date_cls
            try:
                parts = [int(p) for p in date.split('-')]
                date_val = date_cls(parts[0], parts[1], parts[2])
            except Exception:
                self.stderr.write('Invalid --date format, expected YYYY-MM-DD')
                return
        else:
            date_val = None
        result = create_daily_stock_snapshots(date=date_val)
        self.stdout.write(self.style.SUCCESS(f"Snapshots: {result}"))