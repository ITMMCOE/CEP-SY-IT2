from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'Create a user with specific permissions'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username')
        parser.add_argument('password', type=str, help='Password')
        parser.add_argument('--email', type=str, default='', help='Email address')
        parser.add_argument('--staff', action='store_true', help='Make user staff')
        parser.add_argument('--superuser', action='store_true', help='Make user superuser')
        parser.add_argument('--permissions', nargs='+', help='Permission codenames (e.g., add_product change_product)')
        parser.add_argument('--group', type=str, help='Add user to this group')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']
        is_staff = options['staff']
        is_superuser = options['superuser']
        permission_codenames = options.get('permissions', [])
        group_name = options.get('group')

        # Check if user exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User "{username}" already exists.'))
            return

        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_staff=is_staff or is_superuser,
            is_superuser=is_superuser
        )

        self.stdout.write(self.style.SUCCESS(f'✓ User "{username}" created'))

        # Add to group
        if group_name:
            group, created = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)
            self.stdout.write(self.style.SUCCESS(f'✓ Added to group "{group_name}"'))

        # Add specific permissions
        if permission_codenames:
            for codename in permission_codenames:
                try:
                    perm = Permission.objects.get(codename=codename)
                    user.user_permissions.add(perm)
                    self.stdout.write(self.style.SUCCESS(f'✓ Added permission: {perm.name}'))
                except Permission.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'⚠ Permission "{codename}" not found'))

        # Show summary
        self.stdout.write(self.style.SUCCESS('\n=== User Created ==='))
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'Email: {email or "(not set)"}')
        self.stdout.write(f'Staff: {"Yes" if is_staff else "No"}')
        self.stdout.write(f'Superuser: {"Yes" if is_superuser else "No"}')
        
        if user.groups.exists():
            self.stdout.write(f'Groups: {", ".join(g.name for g in user.groups.all())}')
        
        if user.user_permissions.exists():
            self.stdout.write(f'Permissions: {user.user_permissions.count()}')

        self.stdout.write(self.style.SUCCESS('\n💡 You can now login with these credentials'))
        self.stdout.write(self.style.SUCCESS('   URL: http://127.0.0.1:8000/login'))
