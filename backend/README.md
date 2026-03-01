# Spa Booking System Backend

This is the backend API for the Spa Booking & Management ERP System. It is built with Node.js, Express, TypeScript, Sequelize, and PostgreSQL.

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

## Setup

1.  **Clone the repository** (if not already done).
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` directory with the following content:
    ```env
    PORT=5000
    DB_NAME=spa_db
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=localhost
    JWT_SECRET=your_jwt_secret_key
    ```
5.  **Database Setup:**
    The application will automatically create the database (`spa_db`) and tables on the first run.

## Running the Server

-   **Development Mode:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

-   **Build for Production:**
    ```bash
    npm run build
    npm start
    ```

## API Modules & Endpoints

All endpoints are prefixed with `/api`. Most endpoints require a Bearer Token (JWT) in the `Authorization` header (`Authorization: Bearer <token>`).

### 1. Authentication (`/auth`)
- `POST /register`: Register a new user (Customer).
- `POST /login`: Login and get JWT token.

### 2. Services (`/services`)
- `GET /`: List all services.
- `GET /categories`: List all service categories.
- `POST /`: Create service (Admin/Manager).
- `PUT /:id`: Update service (Admin/Manager).
- `DELETE /:id`: Delete service (Admin/Manager).

### 3. Employees (`/employees`)
- `GET /`: List employees.
- `GET /:id`: Get employee details.
- `POST /`: Create employee profile (Admin/Manager).
- `PUT /:id`: Update employee profile (Admin/Manager).

### 4. Bookings (`/bookings`)
- `GET /`: List bookings (Admin/Manager sees all, Customer/Employee sees theirs).
- `POST /`: Create a booking.
- `PUT /:id/status`: Update booking status.

### 5. Customers (`/customers`)
- `GET /`: List customers (Admin/Manager).
- `GET /:id`: Get customer details.
- `PUT /:id`: Update customer details.

### 6. Products / Inventory (`/products`)
- `GET /`: List products.
- `POST /`: Add product (Admin/Manager).
- `PUT /:id`: Update product (Admin/Manager).
- `DELETE /:id`: Delete product (Admin/Manager).

### 7. Rooms (`/rooms`)
- `GET /`: List rooms.
- `POST /`: Add room (Admin/Manager).
- `PUT /:id`: Update room status.

### 8. Memberships (`/memberships`)
- `GET /`: List membership plans.
- `POST /`: Create plan (Admin/Manager).
- `POST /assign`: Assign plan to customer (Admin/Manager).
- `GET /my/subscription`: Get current user's subscription.

### 9. Loyalty (`/loyalty`)
- `GET /tiers`: List loyalty tiers.
- `GET /me`: Get current user's loyalty points.
- `POST /tiers`: Create tier (Admin/Manager).

### 10. Payments (`/payments`)
- `GET /`: List payments (Admin/Manager).
- `POST /`: Record a payment.

### 11. Attendance (`/attendance`)
- `POST /check-in`: Employee check-in.
- `POST /check-out`: Employee check-out.
- `GET /`: View attendance records (Admin/Manager).

### 12. Marketing (`/marketing`)
- `POST /gift-cards`: Issue gift card (Admin/Manager).
- `GET /gift-cards`: List gift cards.
- `POST /gift-cards/redeem`: Redeem gift card.
- `POST /coupons`: Create coupon (Admin/Manager).
- `POST /coupons/validate`: Validate coupon code.

## Data Seeding

On the first run, the server will seed:
- Default Users: Admin (`admin@spabook.com`), Manager, Therapist.
- Sample Service Categories & Services.
- Default Password for seeded users: `1234`
