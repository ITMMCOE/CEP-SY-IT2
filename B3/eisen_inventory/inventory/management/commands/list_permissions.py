from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'List all available permissions in the system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--app',
            type=str,
            help='Filter by app label (e.g., inventory, auth)',
        )

    def handle(self, *args, **options):
        app_label = options.get('app')

        self.stdout.write(self.style.SUCCESS('=== Available Permissions ===\n'))

        # Get all permissions
        permissions = Permission.objects.select_related('content_type').all()
        
        if app_label:
            permissions = permissions.filter(content_type__app_label=app_label)

        # Group by app and model
        apps = {}
        for perm in permissions:
            app = perm.content_type.app_label
            model = perm.content_type.model
            
            if app not in apps:
                apps[app] = {}
            if model not in apps[app]:
                apps[app][model] = []
            
            apps[app][model].append(perm)

        # Display permissions
        for app_name, models in sorted(apps.items()):
            self.stdout.write(self.style.SUCCESS(f'\n📦 {app_name.upper()}'))
            
            for model_name, perms in sorted(models.items()):
                self.stdout.write(f'\n  📄 {model_name}:')
                for perm in perms:
                    self.stdout.write(f'     • {perm.codename:30s} - {perm.name}')

        self.stdout.write(self.style.SUCCESS('\n\n💡 Usage Examples:'))
        self.stdout.write('  Create user with permissions:')
        self.stdout.write('    python manage.py create_user john password123 --staff --permissions add_product change_product')
        self.stdout.write('\n  Change password:')
        self.stdout.write('    python manage.py change_password admin newpass123')
