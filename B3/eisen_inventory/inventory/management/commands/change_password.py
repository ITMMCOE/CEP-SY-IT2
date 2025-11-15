from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Change superuser password'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the superuser')
        parser.add_argument('password', type=str, help='New password')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']

        try:
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'Password changed successfully for user: {username}'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'New credentials: {username} / {password}'
            ))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(
                f'User "{username}" does not exist.'
            ))
            self.stdout.write(self.style.WARNING(
                'Available users:'
            ))
            for u in User.objects.all():
                self.stdout.write(f'  - {u.username} ({"superuser" if u.is_superuser else "staff" if u.is_staff else "user"})')
