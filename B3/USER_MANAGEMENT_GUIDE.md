# 👥 User Management & Admin Panel Guide

## 🎯 Overview

The Eisen Inventory system now has complete user management with:
- Login-first authentication (default page is login)
- Django Admin Panel with full user/permission management
- Custom management commands for easy user creation
- Role-based access control

---

## 🚀 Quick Start

### Default Access
When you visit http://127.0.0.1:8000/ you will be redirected to the **login page**.

### Current Superuser Credentials
- **Username**: `admin`
- **Password**: `newadmin2025`

---

## 📋 Admin Panel Features

Access the admin panel at: **http://127.0.0.1:8000/admin**

### Available in Admin Panel:

#### 1. **Users** ✅
- Create new users
- Edit user details (email, name, etc.)
- Set passwords
- Assign staff/superuser status
- Manage user permissions
- Add users to groups

#### 2. **Groups** ✅
- Create permission groups (e.g., "Warehouse Staff", "Managers")
- Assign permissions to groups
- Add users to groups for bulk permission management

#### 3. **Inventory Models** ✅
- Products
- Suppliers
- Supplier Products
- Inventory Batches
- Stock Alerts
- Product Stock Snapshots

---

## 🔧 Management Commands

### 1. Create User with Permissions

```bash
python manage.py create_user <username> <password> [options]
```

**Options:**
- `--email EMAIL` - Set user email
- `--staff` - Make user staff (can access admin panel)
- `--superuser` - Make user superuser (full access)
- `--permissions PERM1 PERM2 ...` - Assign specific permissions
- `--group GROUPNAME` - Add user to a group

**Examples:**

```bash
# Create a view-only user
python manage.py create_user john password123 --staff --permissions view_product view_supplier view_stockalert

# Create a manager with full product access
python manage.py create_user manager manager123 --staff --permissions add_product change_product delete_product view_product

# Create a superuser
python manage.py create_user admin2 admin2pass --superuser

# Create user and add to group
python manage.py create_user bob password123 --staff --group "Warehouse Staff"
```

### 2. Change Password

```bash
python manage.py change_password <username> <new_password>
```

**Examples:**

```bash
# Change admin password
python manage.py change_password admin newpass123

# Change any user's password
python manage.py change_password john newpassword
```

### 3. List Available Permissions

```bash
python manage.py list_permissions [--app APP_NAME]
```

**Examples:**

```bash
# List all permissions
python manage.py list_permissions

# List only inventory app permissions
python manage.py list_permissions --app inventory

# List only auth permissions
python manage.py list_permissions --app auth
```

---

## 🔐 Permission Types

### Inventory Permissions

#### Product Permissions
- `view_product` - View products
- `add_product` - Create new products
- `change_product` - Edit products
- `delete_product` - Delete products

#### Supplier Permissions
- `view_supplier` - View suppliers
- `add_supplier` - Create suppliers
- `change_supplier` - Edit suppliers
- `delete_supplier` - Delete suppliers

#### Stock Alert Permissions
- `view_stockalert` - View alerts
- `add_stockalert` - Create alerts
- `change_stockalert` - Edit alerts
- `delete_stockalert` - Delete alerts

#### Other Permissions
- `view_inventorybatch`, `add_inventorybatch`, etc.
- `view_supplierproduct`, `add_supplierproduct`, etc.
- `view_productstocksnapshot`, etc.

---

## 👤 Sample Users

### 1. Admin (Superuser)
- **Username**: `admin`
- **Password**: `newadmin2025`
- **Access**: Full system access
- **Can**: Everything

### 2. Manager (Staff with Product/Supplier Access)
- **Username**: `manager`
- **Password**: `manager123`
- **Access**: Product and supplier management
- **Can**: Add, edit, delete products and suppliers

### 3. John (View-Only User)
- **Username**: `john`
- **Password**: `password123`
- **Access**: Read-only access
- **Can**: View products, suppliers, and alerts

---

## 🎭 Creating Custom Roles

### Example: Warehouse Staff Role

1. **In Admin Panel:**
   - Go to Groups → Add Group
   - Name: "Warehouse Staff"
   - Select permissions:
     - ✅ view_product
     - ✅ change_product (for updating stock)
     - ✅ view_inventorybatch
     - ✅ add_inventorybatch
     - ✅ view_stockalert

2. **Via Command:**
   ```bash
   # Create the user
   python manage.py create_user warehouse1 pass123 --staff --group "Warehouse Staff"
   ```

### Example: Sales Manager Role

1. **Permissions needed:**
   - View all products
   - View suppliers
   - View and manage stock alerts
   - View reports

2. **Command:**
   ```bash
   python manage.py create_user sales_mgr pass123 --staff \
     --permissions view_product view_supplier view_stockalert \
     change_stockalert view_productstocksnapshot
   ```

---

## 🔄 Login Flow

1. **Visit http://127.0.0.1:8000/**
   - Automatically redirects to `/login`

2. **Enter credentials**
   - Username
   - Password

3. **Successful login redirects to:**
   - Dashboard (`/dashboard`)
   - Shows user info in menu
   - Logout option available

4. **Protected routes:**
   - `/dashboard` - Dashboard
   - `/products` - Products page
   - `/suppliers` - Suppliers page
   - `/alerts` - Alerts page
   - `/reports` - Reports page
   - `/upload` - Upload page

---

## 🛡️ Admin Panel Features

### User Management

#### Create User
1. Go to Admin Panel → Users → Add User
2. Enter username and password
3. Click "Save and continue editing"
4. Fill in additional details:
   - Email, first name, last name
   - Staff status (for admin access)
   - Superuser status (for full access)
   - Groups (bulk permissions)
   - User permissions (specific permissions)

#### Edit User
1. Go to Users → Click on username
2. Modify any field
3. Save changes

#### Set Permissions
1. Edit user
2. Scroll to "Permissions" section
3. Either:
   - Add to Groups (recommended for bulk)
   - Or assign individual permissions

#### Change Password
1. Edit user
2. Click "this form" link next to password
3. Enter new password twice
4. Save

---

## 📊 Permission Levels

### Level 1: No Access
- No staff status
- Cannot access admin panel
- Can only use API (if authenticated)

### Level 2: View Only
```bash
python manage.py create_user viewer pass123 --staff \
  --permissions view_product view_supplier view_stockalert
```
- Can see data
- Cannot modify anything

### Level 3: Department Manager
```bash
python manage.py create_user dept_mgr pass123 --staff \
  --permissions add_product change_product delete_product \
  view_product add_supplier change_supplier view_supplier
```
- Can manage products and suppliers
- Cannot access user management

### Level 4: Superuser
```bash
python manage.py create_user admin2 pass123 --superuser
```
- Full access to everything
- Can create/delete users
- Can assign permissions
- Can access all models

---

## 🔍 Checking Current Users

### Via Admin Panel
- Go to http://127.0.0.1:8000/admin
- Click "Users"
- See all users with their status

### Via Command
```bash
cd "X:\CODES\Eisen Inventory\eisen_inventory"
python manage.py shell
```

Then in shell:
```python
from django.contrib.auth.models import User

# List all users
for u in User.objects.all():
    print(f"{u.username} - Staff: {u.is_staff}, Super: {u.is_superuser}")

# Check specific user permissions
user = User.objects.get(username='john')
print(user.get_all_permissions())
```

---

## 🎓 Best Practices

### 1. Use Groups for Common Roles
- Create groups like "Warehouse", "Sales", "Management"
- Assign permissions to groups
- Add users to groups (easier management)

### 2. Principle of Least Privilege
- Give users only the permissions they need
- Start with view-only, add as needed

### 3. Regular Password Changes
```bash
# Change superuser password monthly
python manage.py change_password admin new_monthly_pass
```

### 4. Audit User Access
- Regularly review user list in admin
- Remove inactive users
- Check permission assignments

---

## 🚨 Troubleshooting

### "Permission Denied" in Admin
- User needs `is_staff=True`
- Check user has appropriate permissions
- Verify user is in correct group

### Can't Login to Admin
- Verify username/password
- Check `is_staff=True`
- Try changing password:
  ```bash
  python manage.py change_password username newpass
  ```

### Can't Create Users in Admin
- Need superuser status
- Or need `auth.add_user` permission

### Forgot Admin Password
```bash
python manage.py change_password admin newpassword123
```

---

## 📞 Quick Reference

### Common Commands

```bash
# List permissions
python manage.py list_permissions --app inventory

# Create superuser
python manage.py create_user admin newpass --superuser

# Create staff user
python manage.py create_user john pass123 --staff

# Change password
python manage.py change_password username newpass

# Create sample data
python manage.py create_sample_data
```

### URLs
- **Login**: http://127.0.0.1:8000/login
- **Dashboard**: http://127.0.0.1:8000/dashboard
- **Admin Panel**: http://127.0.0.1:8000/admin

### Current Credentials
- **Admin**: `admin` / `newadmin2025`
- **Manager**: `manager` / `manager123`
- **John (View-Only)**: `john` / `password123`

---

## ✅ Summary

✅ Login is now the default starting page
✅ Admin panel shows all models (Products, Suppliers, Users, Groups, etc.)
✅ Full user management in admin panel
✅ Password can be changed via admin or command
✅ Permissions can be assigned individually or via groups
✅ Three management commands for easy user management:
   - `create_user` - Create users with permissions
   - `change_password` - Change any user's password
   - `list_permissions` - See available permissions

---

**Eisen Inventory** - Complete User & Permission Management
