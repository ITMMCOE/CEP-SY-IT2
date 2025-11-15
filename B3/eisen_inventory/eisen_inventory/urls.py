"""
URL configuration for eisen_inventory project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
import os

class ReactAppView(TemplateView):
    """Serve the React app index.html for all frontend routes."""
    template_name = None
    
    def get(self, request, *args, **kwargs):
        from django.http import FileResponse, HttpResponseNotFound
        index_path = settings.FRONTEND_BUILD_DIR / 'index.html'
        if os.path.exists(index_path):
            return FileResponse(open(index_path, 'rb'), content_type='text/html')
        return HttpResponseNotFound('Frontend build not found. Run: cd frontend && npm run build')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
]

# Serve static files from frontend/dist/assets in development
if settings.DEBUG:
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', serve, {
            'document_root': settings.FRONTEND_BUILD_DIR / 'assets',
        }),
    ]

# Catch-all: serve React app for all other routes (must be last)
# Exclude admin and api routes
urlpatterns += [
    re_path(r'^(?!admin|api).*$', ReactAppView.as_view(), name='react-app'),
]
