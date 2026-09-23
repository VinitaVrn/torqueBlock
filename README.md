# Torque Block — B2B Motorcycle Tyre Commerce Platform

A high-performance B2B motorcycle tyre purchasing platform built for the **Torque Block Full Stack Developer Assignment**.

The application implements the complete end-to-end customer journey: **Catalogue Browsing with Search, Filters & Pagination → Product Specifications → Real-Time Cart Management → Checkout & Address Capture → Sandbox Payment Gateway Integration → Server-Side Signature Verification & Stock Deduction → Customer Order History with Snapshots**.

---

## 🌟 Key Features

### 1. B2B Authentication
* **JWT-Based Authentication**: Secure login and registration for motorcycle workshops, dealers, and garages.
* **Company & Workshop Details**: Captures business entity names, contact info, and multiple delivery addresses.

### 2. Tyre Catalogue & Search
* **Dynamic Search & Multi-Filter**: Real-time search across tyre brand, model, size, and category.
* **Filter by Category**: Supersport, Sport Touring, Adventure / Dual Sport, Track / Racing, Urban / Commuter.
* **Pagination**: Server-side pagination with configurable page size (`page` & `limit`).
* **B2B Wholesale Pricing**: Clear display of dealer wholesale rates alongside retail MRP comparison.
* **Live Stock Indicators**: Real-time inventory tracking and low-stock alerts.

### 3. Cart & Server-Side Zero-Trust Business Logic
* **No Client Trust for Pricing**: The frontend only displays prices; all subtotal and total calculations are computed server-side.
* **Persistent Cart**: Synced with MongoDB for the authenticated dealer across page reloads and devices.
* **Optimized Bulk Lookups**: High-performance product Map lookups eliminating N+1 database queries.
* **Live Stock Validation**: Prevents adding or checking out more units than physically available in warehouse stock.

### 4. Checkout & Order Creation
* **Server-Generated Order Numbers**: Formatted uniquely as `TB-ORD-YYYYMMDD-XXXX`.
* **Immutable Product Snapshots**: Order records freeze the purchased tyre model name, SKU, size, unit price, and quantity at time of purchase so future price edits do not mutate historical records.
* **Separate Statuses**: Decoupled `orderStatus` (`Pending Payment`, `Paid/Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) and `paymentStatus` (`Pending`, `Success`, `Failed`, `Refunded`).
* **Ownership Security (IDOR Prevention)**: Strict authorization ensuring dealers can only access their own orders.

### 5. Payment Gateway Integration (Razorpay Sandbox)
* **Gateway Order Generation**: Backend endpoint `/api/payments/create` initializes gateway orders.
* **Server-Side HMAC SHA256 Signature Verification**: Endpoint `/api/payments/verify` cryptographically validates payments before confirming orders.
* **Atomic Stock Deduction**: Automatically decrements product stock and clears the cart only upon verified payment.
* **Idempotency & Duplicate Protection**: Handles duplicate verification requests safely without double stock deductions.
* **Failure & Cancellation Handling**: Gracefully logs payment abandonments and offers a 1-click **"Retry Payment"** action on the order details page.

---

##  Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | **Next.js 14 (App Router)**, React 18, JavaScript (`.jsx`), Tailwind CSS, Lucide Icons |
| **State Management** | **Redux Toolkit** (Cart & Auth persistence without over-engineering) |
| **Backend** | **Node.js**, **Express.js REST API**, CORS, dotenv, JSON Web Tokens (JWT), bcryptjs |
| **Payment Gateway** | **Razorpay SDK** (Sandbox Test Mode with HMAC SHA256 Verification) |
| **Database** | **MongoDB** (Mongoose ODM) with indexing for text search and queries |
| **DevOps** | **Docker & Docker Compose** for MongoDB containerization |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18+ (tested on v20.x)
* **Docker**: (Optional, to run MongoDB container) or local MongoDB instance

---

### Step 1: Start MongoDB Container
From the root directory:
```bash

```
*(Or ensure your local MongoDB service is running on port 27017).*

---

### Step 2: Backend Setup & Database Seeding

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Seed the database with 10 premium motorcycle tyres and test user accounts:
   ```bash
   npm run seed
   ```

3. Start the Express server:
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

---

### Step 3: Frontend Setup

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔑 Test Credentials & Demo Accounts

### B2B Dealer Account
* **Email:** `dealer@torqueblock.com`
* **Password:** `password123`

*(Quick 1-click login button is also provided directly on the `/login` page for fast testing).*

---

##  Testing Payment Scenarios (Razorpay Sandbox)

1. **Successful Payment Flow**:
   - Log in as `dealer@torqueblock.com`.
   - Add tyres to cart (e.g. Pirelli Diablo Rosso IV, Michelin Road 6).
   - Go to `/cart` → Click **Proceed to Checkout**.
   - Review address and click **Pay with Razorpay Sandbox**.
   - The backend validates stock and creates the gateway order.
   - Upon verification, the order updates to `Paid/Confirmed`, stock is reduced in database, cart is cleared, and you are redirected to the order invoice.

2. **Failed / Cancelled Payment Flow**:
   - At checkout, close the Razorpay payment modal or test with a simulated failure.
   - Backend records the failure reason and marks `paymentStatus: 'Failed'`.
   - Open `/orders` → Click on the order.
   - Click the **Complete Payment Now** button to retry and complete payment.

---

## 📂 Project Architecture

```text
projects-ecom/
│
├── docker-compose.yml           # Runs MongoDB container
├── docs/
│   └── postman_collection.json  # Exportable Postman collection
├── README.md                    # Complete project documentation
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── config/              # db.js, razorpay.js
│   │   ├── controllers/         # auth, product, cart, order, payment
│   │   ├── middleware/          # auth.js, errorHandler.js
│   │   ├── models/              # User, Product, Cart, Order, Payment
│   │   ├── routes/              # Express API route modules
│   │   ├── utils/               # seedData.js, seed.js
│   │   ├── app.js               # Express application config
│   │   └── server.js            # Server entry point
│
└── frontend/
    ├── .env.local
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── src/
        ├── app/
        │   ├── layout.jsx       # Root layout with Navbar & Providers
        │   ├── page.jsx         # Redirects to /products
        │   ├── login/           # Login page
        │   ├── register/        # Registration page
        │   ├── products/        # Catalogue & Product details ([id])
        │   ├── cart/            # Cart management
        │   ├── checkout/        # Checkout & Razorpay trigger
        │   └── orders/          # Orders list & Order details ([id])
        ├── components/          # Navbar, Footer, StatusBadge, Pagination, Providers
        ├── store/               # Minimal Redux Toolkit (authSlice, cartSlice)
        └── lib/                 # api.js (Axios), razorpay.js (Script loader)
```

---

##  REST API Summary

Standard API response format:
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new B2B customer | Public |
| `POST` | `/api/auth/login` | Login customer & return JWT | Public |
| `GET` | `/api/auth/me` | Get authenticated user profile | Private |
| `GET` | `/api/products` | Paginated product catalogue with search & filters | Public |
| `GET` | `/api/products/:id` | Get single tyre specifications | Public |
| `GET` | `/api/cart` | Get current customer's cart with server subtotals | Private |
| `POST` | `/api/cart/items` | Add tyre item to cart with stock validation | Private |
| `PATCH`| `/api/cart/items/:productId` | Update item quantity in cart | Private |
| `DELETE`| `/api/cart/items/:productId` | Remove item from cart | Private |
| `POST` | `/api/orders` | Create order with snapshots & server calculation | Private |
| `GET` | `/api/orders` | Get logged-in customer's order history | Private |
| `GET` | `/api/orders/:id` | Get single order details (ownership validated) | Private |
| `POST` | `/api/payments/create` | Initialize Razorpay gateway payment order | Private |
| `POST` | `/api/payments/verify` | Verify HMAC SHA256 signature server-side & deduct stock | Private |
| `POST` | `/api/payments/fail` | Record payment cancellation / failure | Private |

---

##  Key Design & Engineering Trade-Offs

1. **Zero-Trust Pricing Architecture**:
   Order prices, tax calculations, and cart totals are calculated strictly on the backend. Even if a malicious client attempts to modify cart prices in transit, the server resolves canonical prices from MongoDB before creating order records.
2. **Immutable Snapshots**:
   Orders store full snapshots of product specifications and unit prices at the time of order creation. This prevents price changes or product updates from corrupting historical financial records.
3. **Optimized Cart Computations**:
   Instead of querying MongoDB on each loop iteration, the backend bulk fetches all product IDs using `$in` and builds an in-memory Map for instantaneous constant-time lookups.
4. **Idempotent Payment Verification**:
   Calling payment verification repeatedly (e.g. rapid clicks or browser reloads) returns existing verified status safely without double-decrementing product stock.
