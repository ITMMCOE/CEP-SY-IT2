Place static images used by the Django-served SPA in this folder.

Logo expected by Home page:
- File name: eisen-logo.png
- Path: eisen_inventory/templates/assets/eisen-logo.png
- Referenced as: /assets/eisen-logo.png in the browser

To update:
1) Save your logo image (PNG recommended) as "eisen-logo.png" in this folder.
2) Reload the Home page; the logo will appear above the "Eisen Traders" heading.

Note: When rebuilding the frontend with Vite, you can also keep the logo here so it is served by Django alongside the hashed JS/CSS assets.
