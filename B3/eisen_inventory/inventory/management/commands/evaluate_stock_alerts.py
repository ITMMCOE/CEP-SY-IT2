from django.core.management.base import BaseCommand
from inventory.utils import evaluate_all_alerts


class Command(BaseCommand):
    help = "Evaluate stock alerts for all products and print summary"

    def handle(self, *args, **options):
        results = evaluate_all_alerts()
        low = sum(1 for r in results if r['status'] == 'LOW')
        approaching = sum(1 for r in results if r['status'] == 'APPROACHING')
        ok = sum(1 for r in results if r['status'] == 'OK')
        self.stdout.write(self.style.SUCCESS(
            f"Evaluated {len(results)} products -> LOW:{low} APPROACHING:{approaching} OK:{ok}"
        ))