# Public Static Uploads Storage

This directory is configured to store public static media assets:
- `/uploads/products/` - Product images
- `/uploads/receipts/` - Generated invoice files
- `/uploads/logos/` - POS brand icons

These files are served publicly by the Express server via the URL path: `/public/*`
For example: `http://localhost:5000/public/uploads/default-product.png`
