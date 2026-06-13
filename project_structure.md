# Cafe POS System - Project Structure & Architecture Diagram

This document provides a professional, structured overview of the full-stack Cafe Point of Sale (POS) system. It details the frontend and backend directory maps, database schema relationships, system architecture, and operational data flows.

---

## 🏗️ System Architecture & Communication Flow

The system follows a modern decoupled frontend/backend architecture with real-time bidirectional syncing.

```mermaid
graph TD
    %% Styling
    classDef clientStyle fill:#e0f7fa,stroke:#00acc1,stroke-width:2px;
    classDef serverStyle fill:#efebe9,stroke:#8d6e63,stroke-width:2px;
    classDef dbStyle fill:#e8f5e9,stroke:#4caf50,stroke-width:2px;
    classDef socketStyle fill:#fff3e0,stroke:#ffb74d,stroke-width:2px;

    subgraph Frontend ["Client-Side (React UI)"]
        UI["React SPA Components"]:::clientStyle
        RQ["Axios / React Query"]:::clientStyle
        SC["Socket.IO Client"]:::clientStyle
    end

    subgraph Backend ["Server-Side (Express.js)"]
        Routes["Express Routing Layer"]:::serverStyle
        Middleware["Middlewares (Auth/Role/Error)"]:::serverStyle
        Controllers["Controllers (Request Handlers)"]:::serverStyle
        Services["Services (Business Logic Layer)"]:::serverStyle
        SocketServer["Socket.IO Server Connection"]:::socketStyle
        Prisma["Prisma ORM Client"]:::serverStyle
    end

    subgraph DatabaseLayer ["Data Storage"]
        DB[("PostgreSQL Database")]:::dbStyle
    end

    subgraph RealTime ["Real-Time Display System"]
        KDS["Kitchen Display System (KDS)"]:::clientStyle
    end

    %% Flow arrows
    UI -->|User Interactions| RQ
    RQ -->|HTTP / REST API + JWT| Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> DB

    UI -.->|Initialize WebSockets| SocketServer
    SocketServer -.->|Order Created event broadcast| SC
    SC -.->|Real-time update| KDS
```

---

## 📂 Directory Map & Project Structure

The project is split into standard `client/` (frontend representation) and `server/` (backend logic) folders.

### 💻 Client Directory (React + Vite)

```
client/
│
├── 📂 public/               # Static public assets (favicons, browser manifest)
│
└── 📂 src/
    │
    ├── 📂 assets/           # Global design resources (images, SVGs, static files)
    │
    ├── 📂 components/       # Reusable React components
    │   ├── 📂 ui/           # Low-level primitives (Buttons, Inputs, Badges, Modals)
    │   ├── 📂 forms/        # Form handlers, validations, inputs
    │   ├── 📂 layout/       # App layout frameworks (Sidebar, Header, KDS shell)
    │   └── 📂 tables/       # Interactive tables (Sortable, Searchable, Paginated grids)
    │
    ├── 📂 pages/            # Router page views representing logical features
    │   ├── 📂 Login/        # Cashier & Admin authentication gateway
    │   ├── 📂 Dashboard/    # Management dashboard containing sales KPIs
    │   ├── 📂 Categories/   # Product categorization management
    │   ├── 📂 Products/     # Menu product editor and list views
    │   ├── 📂 Floors/       # Cafe seating floor controller
    │   ├── 📂 Tables/       # Seat & table count konfigurator
    │   ├── 📂 Customers/    # Customer CRM, search, and directory
    │   ├── 📂 Orders/       # Past orders list & receipt lookup tool
    │   ├── 📂 POS/          # POS Terminal screen (Live Cart, Product grid, table selector)
    │   ├── 📂 Kitchen/      # Kitchen Display System (KDS) queue screen
    │   ├── 📂 Payments/     # Checkout and receipt printing/email operations
    │   └── 📂 Reports/      # Business reports interface (Exports, trends)
    │
    ├── 📂 services/         # Modular REST API interaction layers (Axios instances)
    │   ├── 📄 authService.js
    │   ├── 📄 categoryService.js
    │   ├── 📄 productService.js
    │   ├── 📄 orderService.js
    │   └── 📄 paymentService.js
    │
    ├── 📂 hooks/            # Custom reusable React and React Query hooks
    ├── 📂 context/          # Global state wrappers (Auth, Cart state, POS session)
    ├── 📂 routes/           # Routing configuration, path links, and route guards
    ├── 📂 utils/            # Helper scripts (formatting currency, calculating totals)
    │
    ├── 📄 App.jsx           # Root routing and application context shell
    └── 📄 main.jsx          # React virtual DOM bootstrap entry point
```

### ⚙️ Server Directory (Node.js + Express)

```
server/
│
├── 📂 prisma/               # Prisma schema modeling directory
│   └── 📄 schema.prisma     # DB connections, schema tables definition & ORM settings
│
└── 📂 src/
    │
    ├── 📂 config/           # Database & platform config loaders
    │   ├── 📄 database.js   # DB connection options
    │   ├── 📄 prisma.js     # Shared Prisma Client initializer instance
    │   └── 📄 socket.js     # Socket.IO connection configurations
    │
    ├── 📂 controllers/      # Route request/response orchestrator controllers
    │   ├── 📄 authController.js
    │   ├── 📄 categoryController.js
    │   ├── 📄 productController.js
    │   ├── 📄 customerController.js
    │   ├── 📄 orderController.js
    │   ├── 📄 paymentController.js
    │   └── 📄 reportController.js
    │
    ├── 📂 services/         # Isolated heavy business logic algorithms
    │   ├── 📄 authService.js
    │   ├── 📄 orderService.js
    │   ├── 📄 paymentService.js
    │   └── 📄 reportService.js
    │
    ├── 📂 middlewares/      # HTTP request lifecycle pipeline hooks
    │   ├── 📄 authMiddleware.js   # Extracts, validates, and decodes JWT tokens
    │   ├── 📄 roleMiddleware.js   # Checks roles (ADMIN, EMPLOYEE) for resource gates
    │   └── 📄 errorMiddleware.js  # Global express central error formatting controller
    │
    ├── 📂 routes/           # Endpoint definition routes
    │   ├── 📄 authRoutes.js
    │   ├── 📄 categoryRoutes.js
    │   ├── 📄 productRoutes.js
    │   ├── 📄 customerRoutes.js
    │   ├── 📄 orderRoutes.js
    │   ├── 📄 paymentRoutes.js
    │   └── 📄 reportRoutes.js
    │
    ├── 📂 sockets/          # Socket connection registers
    │   └── 📄 kitchenSocket.js    # Relays orders instantly to the KDS
    │
    ├── 📂 validations/      # Validation schemas for incoming payloads (Joi/Zod)
    │
    ├── 📄 app.js            # Express core framework instantiation
    └── 📄 server.js         # Port listener, websocket attachment, server trigger
```

---

## 💾 Database Entity-Relationship Diagram (PostgreSQL)

The database models are designed for relational stability, supporting audit trails (sessions), discounts, and orders.

```mermaid
erDiagram
    users {
        Int id PK
        String email UK
        String password
        String role "ADMIN | EMPLOYEE"
        String status "ACTIVE | ARCHIVED"
    }

    sessions {
        Int id PK
        Int userId FK
        DateTime openingTime
        DateTime closingTime
        Decimal openingBalance
        Decimal closingAmount
        String status "OPEN | CLOSED"
    }

    customers {
        Int id PK
        String name
        String email
        String phone
    }

    categories {
        Int id PK
        String name
        String color
    }

    products {
        Int id PK
        String name
        Int categoryId FK
        Decimal price
        Decimal taxPercentage
        String uom "Unit of Measure"
        String description
        Boolean active
    }

    floors {
        Int id PK
        String name
    }

    tables {
        Int id PK
        Int floorId FK
        String tableNumber
        Int seatsCount
        Boolean active
    }

    orders {
        Int id PK
        Int sessionId FK
        Int tableId FK
        Int customerId FK
        String orderNumber UK
        String status "DRAFT | KITCHEN | PREPARING | COMPLETED | PAID | CANCELLED"
        Decimal subtotal
        Decimal tax
        Decimal discount
        Decimal grandTotal
        DateTime createdAt
    }

    order_items {
        Int id PK
        Int orderId FK
        Int productId FK
        Int quantity
        Decimal unitPrice
        Decimal taxAmount
        Decimal discountAmount
        Decimal total
    }

    payments {
        Int id PK
        Int orderId FK
        String method "CASH | CARD | UPI"
        Decimal amount
        String transactionReference
        DateTime paymentDate
    }

    coupons {
        Int id PK
        String code UK
        String discountType "PERCENTAGE | FIXED"
        Decimal discountValue
        DateTime expirationDate
        Boolean active
    }

    order_coupons {
        Int id PK
        Int orderId FK
        Int couponId FK
    }

    promotions {
        Int id PK
        String name
        String type "PRODUCT | ORDER"
        Int triggerQty "Optional"
        Decimal triggerValue "Optional"
        Decimal discountValue
        Boolean active
    }

    %% Relationships
    users ||--o{ sessions : "starts"
    floors ||--o{ tables : "contains"
    tables ||--o{ orders : "binds"
    customers ||--o{ orders : "receives"
    orders ||--o{ order_items : "contains"
    products ||--o{ order_items : "provides"
    categories ||--o{ products : "groups"
    orders ||--o{ payments : "processed_by"
    orders ||--o{ order_coupons : "applies"
    coupons ||--o{ order_coupons : "redeemed_by"
    sessions ||--o{ orders : "registers"
```

---

## ⚡ Real-Time Synchronization Flow (Socket.IO KDS)

When an order is updated, details are instantaneously synced across terminals.

```mermaid
sequenceDiagram
    autonumber
    actor Employee as POS Cashier
    participant Client as POS Client
    participant Server as Socket.IO Server
    participant DB as PostgreSQL
    participant KDS as Kitchen Screen (KDS)

    Employee->>Client: Clicks "Send To Kitchen"
    Client->>Server: HTTP POST /api/orders (Create/Update Order)
    Server->>DB: Save Order & status: "Sent To Kitchen"
    DB-->>Server: Confirm Saved
    Server->>Server: Emit WS event: "order_sent" (with payload)
    Server-->>Client: HTTP 201 Response
    Server-->>KDS: WebSocket Broadcast: "kds:new_order"
    Note over KDS: Kitchen Screen updates instantly without reload!
    
    actor Chef as Kitchen Staff
    Chef->>KDS: Click "Start Preparing"
    KDS->>Server: Emit WS event: "kds:start_preparing"
    Server->>DB: Update status to "PREPARING"
    Server-->>Client: WebSocket Broadcast: "pos:order_preparing"
    Note over Client: POS Table UI changes color to indicate "Preparing" status
```

---

## 🔒 Authentication Flow (JWT Validation)

Authenticating requests ensures strict access controls over POS operations and admin stats.

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee / Admin
    participant Client as React SPA (Client)
    participant Express as Express Router
    participant AuthMW as Auth Middleware
    participant Controller as Controller (e.g. Products)
    participant DB as PostgreSQL

    User->>Client: Input credentials & submit Login
    Client->>Express: POST /api/auth/login
    Express->>DB: Check email & password hash
    DB-->>Express: Return user validation data
    Express->>Express: Generate JWT (Signed with Secret, roles, userId)
    Express-->>Client: Send response (200 OK + JWT + User profile)
    Client->>Client: Store JWT securely in LocalState/Context
    
    Note over Client, Express: Subsequent Authorized Request
    Client->>Express: GET /api/admin/reports (Headers: Bearer <token>)
    Express->>AuthMW: Intercept & verify JWT signature
    AuthMW->>AuthMW: Decode payload, extract role & metadata
    alt Token Invalid / Expired
        AuthMW-->>Client: 401 Unauthorized Response
    else Token Valid but Role does not match ADMIN
        AuthMW-->>Client: 403 Forbidden Response
    else Access Authorized
        AuthMW->>Controller: Forward context (req.user)
        Controller->>DB: Fetch analytics reports
        DB-->>Controller: Return metrics payload
        Controller-->>Client: Send report dataset (200 OK)
    end
```

---

## 🔄 Cafe POS Business Operations Flow

The life cycle of restaurant transactions from session start to metrics reporting:

```mermaid
graph LR
    classDef step fill:#e1f5fe,stroke:#0288d1,stroke-width:1.5px;
    classDef done fill:#c8e6c9,stroke:#388e3c,stroke-width:1.5px;

    Start([Start Shift]) --> Login[Employee Login]:::step
    Login --> OpenSession[Open Session & Opening Cash]:::step
    OpenSession --> TableGrid[Select Floor & Table]:::step
    TableGrid --> CartOps[Create Order & Select Products]:::step
    CartOps --> CheckoutOpts{Apply discount/promo?}:::step
    
    CheckoutOpts -- Coupon Code --> AddCoupon[Verify & Apply Discount]:::step
    CheckoutOpts -- Automatic Promo --> AddPromo[Calculate Promo Discount]:::step
    CheckoutOpts -- Standard pricing --> KitchenFlow[Send To Kitchen]:::step
    
    AddCoupon --> KitchenFlow
    AddPromo --> KitchenFlow
    
    KitchenFlow --> KDSQueue[KDS updates via Socket.IO]:::step
    KDSQueue --> Prep[Kitchen Staff Prepares Meal]:::step
    Prep --> Pay[Complete Prep & Process Payment]:::step
    
    Pay --> Receipt[Print/Email Invoice & Receipt]:::step
    Receipt --> ShiftEnd{End of Shift?}:::step
    
    ShiftEnd -- No --> TableGrid
    ShiftEnd -- Yes --> CloseSession[Generate Session Report & Close Session]:::done
    CloseSession --> AdminReports[Admin reviews Analytics Reports]:::done
```
