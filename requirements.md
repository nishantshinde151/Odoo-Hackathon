# Cafe POS System - Requirements Specification

## Project Overview

The Cafe POS System is a full-stack restaurant management application that enables administrators and employees to manage products, tables, orders, kitchen operations, payments, and business reports.

The system consists of three major components:

1. Admin Dashboard
2. POS Terminal
3. Kitchen Display System (KDS)

---

# User Roles

## Admin

The Admin is responsible for configuring and managing the system.

### Permissions

* Manage products
* Manage categories
* Manage floors
* Manage tables
* Manage employees
* Manage payment methods
* Manage coupons
* Manage promotions
* Open and close POS sessions
* Access reports and analytics
* Monitor kitchen operations

---

## Employee

The Employee operates the POS terminal.

### Permissions

* Select tables
* Create and manage orders
* Search and create customers
* Apply coupons
* Send orders to kitchen
* Process payments
* Print receipts
* Email receipts
* View session orders

---

## Customer

Customers do not log into the system.

Customer information is maintained by employees for order tracking and receipt delivery.

---

# Functional Requirements

## Authentication Module

### Features

* User Registration
* User Login
* User Logout
* JWT Authentication
* Role-Based Authorization

### Roles

* ADMIN
* EMPLOYEE

---

# Employee Management

### Features

* Create Employee
* Update Employee
* Archive Employee
* Delete Employee
* Change Password
* List Employees

### Fields

* Name
* Email
* Role
* Status

---

# Product Management

### Features

* Create Product
* Edit Product
* Delete Product
* View Product List

### Product Fields

* Name
* Category
* Price
* Tax Percentage
* Unit Of Measure
* Description
* Active Status

---

# Category Management

### Features

* Create Category
* Edit Category
* Delete Category

### Category Fields

* Name
* Color

---

# Payment Method Management

### Features

* Enable Payment Method
* Disable Payment Method
* Configure UPI ID

### Supported Methods

* Cash
* Card
* UPI

---

# Floor Management

### Features

* Create Floor
* Update Floor
* Delete Floor
* View Floors

### Floor Fields

* Name

---

# Table Management

### Features

* Create Table
* Update Table
* Activate Table
* Deactivate Table
* View Tables

### Table Fields

* Floor
* Table Number
* Number Of Seats
* Active Status

---

# Customer Management

### Features

* Create Customer
* Update Customer
* Delete Customer
* Search Customer

### Customer Fields

* Name
* Email
* Phone Number

---

# Coupon Management

### Features

* Create Coupon
* Update Coupon
* Delete Coupon
* Activate Coupon
* Deactivate Coupon

### Coupon Fields

* Coupon Code
* Discount Type
* Discount Value
* Expiration Date

### Discount Types

* Percentage
* Fixed Amount

---

# Promotion Management

### Features

* Create Promotion
* Update Promotion
* Delete Promotion

### Promotion Types

#### Product Promotion

Triggered when minimum quantity is reached.

Example:

* Buy 3 Coffees
* Get 10% Off

#### Order Promotion

Triggered when minimum order value is reached.

Example:

* Spend ₹1000
* Get ₹100 Off

---

# POS Session Management

### Features

* Open Session
* Close Session
* Session Summary
* View Previous Sessions

### Session Information

* Opening Time
* Closing Time
* Opening Balance
* Closing Amount
* Total Orders
* Total Revenue

---

# POS Terminal

## Floor View

### Features

* Display Floors
* Display Tables
* Show Occupied Tables
* Show Available Tables
* Select Table

---

## Order Management

### Features

* Create Order
* Update Order
* Save Draft
* Cancel Order
* Complete Order
* View Orders

### Order Statuses

* Draft
* Sent To Kitchen
* Preparing
* Completed
* Paid
* Cancelled

---

## Cart Management

### Features

* Add Product
* Remove Product
* Increase Quantity
* Decrease Quantity
* Calculate Subtotal
* Calculate Tax
* Calculate Discounts
* Calculate Total

---

## Customer Assignment

### Features

* Attach Customer To Order
* Create Customer During Order

---

## Coupon Application

### Features

* Enter Coupon Code
* Validate Coupon
* Apply Discount

---

## Product Search

### Features

* Search Product By Name
* Filter Product By Category

---

# Kitchen Display System (KDS)

## Features

* Receive Orders In Real Time
* Display Active Orders
* Update Order Status
* Complete Individual Items
* Complete Entire Orders

## Kitchen Statuses

* To Cook
* Preparing
* Completed

## Search & Filters

* Search Orders
* Filter By Product
* Filter By Category

---

# Payment Processing

## Cash Payment

### Features

* Enter Received Amount
* Calculate Change

---

## Card Payment

### Features

* Enter Transaction Reference
* Confirm Payment

---

## UPI Payment

### Features

* Generate QR Code
* Confirm Payment
* Cancel Payment

---

# Receipt Management

### Features

* Generate Receipt
* Print Receipt
* Email Receipt

### Receipt Information

* Order Number
* Customer Details
* Products
* Tax
* Discounts
* Payment Method
* Total Amount

---

# Orders History

### Features

* View Orders
* Search Orders
* Filter Orders
* View Order Details

### Search Filters

* Customer Name
* Order Number
* Date

---

# Reporting & Analytics

## Dashboard Metrics

* Total Revenue
* Total Orders
* Average Order Value

---

## Reports

### Sales Trend Report

Revenue over time.

### Top Products Report

Most sold products.

### Top Categories Report

Highest revenue categories.

### Top Orders Report

Highest-value orders.

---

## Filters

* Today
* This Week
* This Month
* Custom Date Range
* Employee
* Session
* Product

---

## Export Options

* PDF
* Excel (XLSX)

---

# Non-Functional Requirements

## Performance

* Dashboard response under 2 seconds
* Order creation under 1 second
* Kitchen updates in real time

---

## Security

* Password hashing using bcrypt
* JWT authentication
* Role-based authorization
* Secure API access

---

## Scalability

* PostgreSQL database
* Normalized schema
* REST API architecture

---

# Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React

---

## Backend

* Node.js
* Express.js
* Prisma ORM

---

## Database

* PostgreSQL

---

## Real-Time Communication

* Socket.IO

---

## Authentication

* JWT
* bcrypt

---

## Charts & Reports

* Recharts

---

## Deployment

### Frontend

* Vercel

### Backend

* Render / Railway

### Database

* Neon PostgreSQL

---

# Complete Business Flow

Login
→ Open Session
→ Select Table
→ Create Order
→ Add Products
→ Apply Discounts
→ Send To Kitchen
→ Kitchen Preparation
→ Payment
→ Receipt Generation
→ Close Session
→ View Reports
