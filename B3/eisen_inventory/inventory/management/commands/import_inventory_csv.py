from django.core.management.base import BaseCommand, CommandError
from inventory.utils import import_inventory_csv, convert_excel_to_csv
from pathlib import Path


class Command(BaseCommand):
    help = "Import inventory from a CSV file (or Excel via --excel). Upserts products and creates batches."

    def add_arguments(self, parser):
        parser.add_argument(
            'path',
            help='Path to CSV file or Excel when using --excel',
        )
        parser.add_argument(
            '--excel',
            action='store_true',
            help='Treat input as Excel and convert to CSV first',
        )
        parser.add_argument(
            '--mode',
            choices=['append', 'replace_all'],
            default='append',
            help='Append to existing data or replace everything',
        )

    def handle(self, *args, **options):
        path = Path(options['path'])
        if not path.exists():
            raise CommandError(f"File not found: {path}")

        if options['excel']:
            self.stdout.write("Converting Excel to CSV...")
            csv_path = convert_excel_to_csv(path)
        else:
            csv_path = str(path)

        self.stdout.write(f"Importing: {csv_path} (mode={options['mode']})")
        result = import_inventory_csv(csv_path, mode=options['mode'])
        self.stdout.write(self.style.SUCCESS(f"Import complete: {result}"))