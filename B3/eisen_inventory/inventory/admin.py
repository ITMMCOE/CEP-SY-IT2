from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import User, Group
from django.urls import path, reverse
from django.shortcuts import render, redirect
from django.db.models import Count
from .models import Product, InventoryBatch, Supplier, SupplierProduct, StockAlert, ProductStockSnapshot
from .utils import import_inventory_csv, convert_excel_to_csv
import os
import tempfile


# Unregister the default User and Group admin
admin.site.unregister(User)
admin.site.unregister(Group)


# Customize admin site index to show user stats
class CustomAdminSite(admin.AdminSite):
    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        # Add user statistics
        all_users = User.objects.all().prefetch_related('groups', 'user_permissions')
        extra_context['all_users'] = all_users
        extra_context['total_users'] = all_users.count()
        extra_context['active_users'] = all_users.filter(is_active=True).count()
        extra_context['superusers'] = all_users.filter(is_superuser=True).count()
        extra_context['staff_users'] = all_users.filter(is_staff=True, is_superuser=False).count()
        
        return super().index(request, extra_context)


# Override the default admin site
admin.site.__class__ = CustomAdminSite


# Custom User Admin with better permissions management
@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('-date_joined',)
    filter_horizontal = ('groups', 'user_permissions')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )


# Custom Group Admin
@admin.register(Group)
class CustomGroupAdmin(BaseGroupAdmin):
    filter_horizontal = ('permissions',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
	list_display = ("name", "sku", "current_stock", "minimum_stock_level", "reorder_status", "active_alerts")
	list_editable = ("current_stock", "minimum_stock_level")
	search_fields = ("name", "sku")
	list_filter = ("reorder_status",)
	change_list_template = "admin/inventory/product/change_list.html"

	def get_urls(self):
		urls = super().get_urls()
		custom = [
			path('upload/', self.admin_site.admin_view(self.upload_view), name='inventory_product_upload'),
		]
		return custom + urls

	def upload_view(self, request):
		"""Admin view to upload CSV/Excel and import inventory."""
		context = dict(
			self.admin_site.each_context(request),
			title="Upload inventory data (CSV or Excel)",
		)
		if request.method == 'POST':
			file = request.FILES.get('file')
			mode = request.POST.get('mode', 'append')
			if mode not in ('append', 'replace_all'):
				mode = 'append'
			if not file:
				messages.error(request, "Please choose a file to upload.")
				return redirect(reverse('admin:inventory_product_changelist'))
			# Save to temp
			suffix = '.xlsx' if file.name.lower().endswith('.xlsx') else '.csv'
			with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
				for chunk in file.chunks():
					tmp.write(chunk)
				tmp_path = tmp.name
			csv_generated_path = None
			try:
				if suffix == '.xlsx':
					csv_generated_path = convert_excel_to_csv(tmp_path)
					csv_path = csv_generated_path
				else:
					csv_path = tmp_path
				result = import_inventory_csv(csv_path, mode=mode)
				messages.success(request, f"Import complete: created={result['created']} updated={result['updated']}")
			except Exception as e:
				messages.error(request, f"Import failed: {e}")
			finally:
				try:
					os.remove(tmp_path)
				except Exception:
					pass
				# If we generated a CSV for Excel uploads, clean it up too
				if csv_generated_path and os.path.exists(csv_generated_path):
					try:
						os.remove(csv_generated_path)
					except Exception:
						pass
			return redirect(reverse('admin:inventory_product_changelist'))

		return render(request, 'admin/inventory/product/upload.html', context)

	def active_alerts(self, obj):
		return obj.active_alerts_count
	active_alerts.short_description = "Active Alerts"


class SupplierProductInline(admin.TabularInline):
	model = SupplierProduct
	extra = 1
	autocomplete_fields = ["product"]
	fields = (
		"product",
		"cost_price",
		"lead_time_days",
		"min_order_quantity",
		"is_preferred",
		"last_supplied_at",
	)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
	list_display = ("name", "contact_name", "email", "phone", "is_active", "product_count")
	list_filter = ("is_active",)
	search_fields = ("name", "contact_name", "email", "phone")
	inlines = [SupplierProductInline]
	readonly_fields = ("created_at", "updated_at", "product_count")


@admin.register(SupplierProduct)
class SupplierProductAdmin(admin.ModelAdmin):
	list_display = (
		"supplier",
		"product",
		"cost_price",
		"lead_time_days",
		"min_order_quantity",
		"is_preferred",
		"last_supplied_at",
	)
	list_filter = ("is_preferred", "supplier")
	search_fields = ("supplier__name", "product__name", "product__sku")
	autocomplete_fields = ("supplier", "product")


@admin.register(InventoryBatch)
class InventoryBatchAdmin(admin.ModelAdmin):
	list_display = ("product", "quantity", "received_at", "supplier", "unit_cost")
	list_filter = ("received_at", "supplier")
	search_fields = ("product__name", "product__sku", "supplier__name")
	autocomplete_fields = ("product", "supplier")


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
	list_display = ("product", "status", "active", "created_at", "resolved_at", "current_stock_at_trigger", "minimum_stock_level")
	list_filter = ("status", "active")
	search_fields = ("product__name", "product__sku")
	autocomplete_fields = ("product",)
	readonly_fields = ("status", "created_at", "resolved_at", "current_stock_at_trigger", "minimum_stock_level", "message")


@admin.register(ProductStockSnapshot)
class ProductStockSnapshotAdmin(admin.ModelAdmin):
	list_display = ("product", "date", "stock_level", "created_at")
	search_fields = ("product__name", "product__sku")
	list_filter = ("date",)
	autocomplete_fields = ("product",)
