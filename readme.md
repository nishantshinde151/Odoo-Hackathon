# Smart Cafe POS & KDS System

A modern, premium Point of Sale (POS) and Kitchen Display System (KDS) designed specifically for cafe outlets. Built with a full-stack JavaScript architecture, real-time socket updates, and a customized coffee-toned visual interface.

---

## 🚀 Key Features & Modules

### 1. POS Terminal & Seating Map
- **Table Allocation & Seating Map**: Visual floor plan representing active zones and tables. Shows occupancy status in real-time.
- **Independent Session Isolation**: Orders are strictly isolated to their active session. When a session is closed and a new one is opened, the seating map and tables are automatically cleared and start fresh.
- **Real-Time Catalog Search**: Search product catalog instantly or filter by category buttons.
- **Auto-applied Promotions**: Support for product-level (e.g., Buy 3 Get X) and order-level discount rules.
- **Discount Coupons**: Validation and application of code-based percentage or fixed amount discounts.

### 2. Custom Spice Preferences
- **Conditional Availability**: Spice preference selection (Mild, Medium, Spicy, Extra Spicy) is conditionally shown *only* for savory food items (Snacks/Starters). Sweets, desserts, coffee, tea, and drinks automatically hide this option.
- **Persistent Storage**: Preferences are fully integrated into database records (`OrderItem.spicePreference`) and sent directly to the kitchen display.

### 3. Kitchen Display System (KDS)
- **Role-Based Access Control**: Protected KDS routes allow access *only* to `ADMIN` and `KITCHEN` users. Regular POS staff (`EMPLOYEE` role) are restricted and cannot view or access the kitchen screen.
- **State-based Order Flow**: Orders proceed through dynamic preparation states: *Pending (To Cook)* -> *Preparing (Cooking Started)* -> *Completed*.
- **No Early Archiving**: Completed orders remain listed on the KDS panel to ensure kitchen staff can track order delivery before clear-down.

### 4. Admin Dashboard & Analytics
- **Live Statistics**: Summary boxes for Today's Sales, Orders Count, Active Tables, and Total Active Sessions.
- **Sales Trends Chart**: Custom bar charts displaying daily sales trends with hover tooltips and coffee-themed aesthetics.

### 5. Auditing & Session Management
- **Cash Drawer Verification**: Mandatory entry of opening balances and closing drawer count audits.
- **Discrepancy Logging**: Automatic calculation and reporting of cash discrepancies during session closure.

### 6. Payments & Receipt Generation
- **Multi-Method Checkout**: Support for Cash, Card, and UPI payments.
- **Receipt Template**: Printable receipts formatted for POS thermal printers.

### 7. Product & Staff Catalog
- **Category & UOM Setup**: Categorize items, select custom units of measure (Cup, Plate, Slice, Glass), and manage active/archived item states.
- **Access Control Roles**: Manage user credentials, access levels (`ADMIN`, `EMPLOYEE`, `KITCHEN`), and activation statuses.

### 8. Business Reports Section
- **Excel/CSV Export**: Client-side blob generation for downloading sales trends, employee logs, and top products.
- **Visual PDF Generation**: Hidden print layouts combined with dynamic charts and graphs for print-ready business summaries.

---

## 🎨 Design System & Responsiveness

- **Coffee-Inspired Aesthetics**: Theme uses harmonious color accents (`#8A583C` Terracotta, `#FAF6F0` Warm Cream) instead of browser defaults.
- **Full-Height Desktop Interface**: POS layout fills the screen exactly using negative margin alignment (`lg:-m-8` / `lg:h-[calc(100vh-80px)]`), preventing double-scrollbars and creating a native desktop application feel.
- **Independent Cart Scrolling**: The order cart sidebar scrolls independently and maintains a spacious layout by using compressed component margins and removing nested flex constraints.
- **Implicit Grid Constraints**: Grid catalog items restrict row height stretch via `auto-rows-max` to prevent single-row pages from stretching down the screen.
- **Mobile Adaptive Fields**: Form grids, top-level select filters, and cart prices wrap or stack vertically (`grid-cols-1 sm:grid-cols-2`) automatically on narrow screens.
- **Premium Custom Dropdowns**: Standard select elements are wrapped in custom relative divs with absolute-positioned `ChevronDown` arrows, custom borders, focus rings, and animated transitions.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS (Vanilla utilities), Lucide React (Icons), React Router DOM, Socket.io Client.
- **Backend**: Node.js, Express, Socket.io (real-time events).
- **Database**: MySQL, Prisma ORM.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL database instance

### 1. Database Configuration
1. In the `server` folder, create a `.env` file:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/db_name"
   JWT_SECRET="your_secret_key"
   PORT=5000
   ```
2. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
3. Seed the database with initial products, categories, floors, and tables:
   ```bash
   npx prisma db seed
   ```

### 2. Run the Server
```bash
cd server
npm install
npm run dev
```

### 3. Run the Client
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:3001` in the browser.
