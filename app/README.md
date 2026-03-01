# SpaBook Pro - Salon & Spa Management System

A comprehensive, enterprise-grade salon and spa management system built with React, TypeScript, Node.js, and PostgreSQL.

## Features

### 1. Customer/User Features
- User registration and secure login (Email/Phone OTP)
- Social login (Google, Facebook)
- Mobile responsive booking interface
- Service browsing with advanced filters
- Multiple service booking in single appointment
- Real-time slot availability
- Combo/package booking support
- Online booking confirmation with QR code
- Booking reschedule and cancellation
- Complete booking history and status tracking
- Customer profile management
- Loyalty points tracking and tier levels
- Coupon/promo code application
- Multiple payment methods support
- Invoice download (PDF format)
- Automated booking reminders
- Gift card purchase and redemption
- Waiting list registration
- Family/group booking management
- Guest checkout option
- Customer review and rating system
- Wishlist/favorite services
- Membership subscription management

### 2. Service Management
- Add/edit/delete services with bulk operations
- Service category and sub-category management
- Service duration configuration
- Service-wise pricing management
- Dynamic pricing based on time/day
- Peak hour pricing automation
- Gender-specific service pricing
- Service description with rich text editor
- Add-on services and upsell recommendations
- Promotional pricing with date range
- Service image gallery
- Service video upload support
- Service bundling/combo package creation
- Seasonal service management
- Service tax configuration
- Service capacity management

### 3. Advanced Booking Management
- Advanced calendar-based dashboard (drag & drop)
- Day/Week/Month/Agenda view options
- Customizable time slot intervals
- Automatic slot generation
- Walk-in booking entry
- Phone booking entry
- Complete booking workflow
- Booking rescheduling with history log
- Automatic double booking prevention
- Real-time booking conflict detection
- No-show tracking and penalty management
- Cancellation policy enforcement
- Deposit/advance payment management
- Partial payment support
- Booking notes and special requests
- VIP customer priority
- Recurring booking setup
- Group booking management
- Automated waitlist management

### 4. Employee/Therapist Management
- Comprehensive employee profiles
- Role-based access control (RBAC)
- Employee service assignment
- Multi-service employee support
- Employee availability calendar
- Shift management system
- Employee workload balancing
- Performance metrics dashboard
- Commission structure setup
- Customer rating system for employees
- Leave management system
- Certification and license tracking
- Training records management

### 5. Intelligent Employee Assignment
- Smart auto-assignment algorithm
- Real-time employee availability
- Automatic overlap prevention
- Round-robin assignment option
- Manual reassignment with reason tracking
- Multi-employee service support
- Customer-requested employee assignment
- Performance-based assignment priority

### 6. Attendance Management
- Employee check-in/check-out system
- GPS-based attendance tracking
- Daily attendance dashboard
- Photo capture at check-in
- Shift-wise attendance management
- Overtime calculation
- Late entry and early exit tracking
- Monthly attendance summary reports

### 7. Advanced CRM System
- 360° customer profile dashboard
- Advanced customer database
- Complete visit history
- Customer preferences tracking
- Customer segmentation (VIP, Regular, New, Dormant, At-Risk)
- Customer lifetime value calculation
- RFM analysis
- Communication history log
- Email/SMS campaign management
- Automated birthday/anniversary wishes
- Win-back campaigns
- Customer referral program

### 8. Loyalty & Rewards Program
- Multi-tier loyalty program (Bronze/Silver/Gold/Platinum)
- Points accumulation on spending/visits/referrals
- Flexible points redemption rules
- Percentage and flat amount discount coupons
- Bulk coupon generation
- Gift card system
- Referral coupon system
- Detailed coupon usage analytics

### 9. Comprehensive Admin Panel
- Fully customizable dashboard
- Real-time booking status board
- Revenue summary (daily/weekly/monthly/yearly)
- Multi-location/branch management
- Complete service catalog management
- Employee management with KPI tracking
- Promotional offers management
- Expense tracking
- Granular system settings
- Complete activity log and audit trail

### 10. Analytics & Reporting Suite
- Real-time revenue analytics
- Service-wise performance reports
- Employee productivity analytics
- Peak booking time heatmap
- Customer retention and churn rate
- 50+ pre-built report templates
- Custom report builder
- Scheduled automatic report delivery
- Export capabilities (PDF/Excel/CSV)

### 11. Payment & Billing System
- Multiple payment gateway integration (Stripe, PayPal, Square)
- Credit/Debit Cards, ACH, Digital Wallets
- Split payment support
- Payment link generation
- Complete refund management
- Installment/partial payment plans
- Tip/gratuity collection
- Professional invoice generation
- Sales tax calculation

### 12. Business Operations
- Flexible working hours configuration
- Comprehensive holiday calendar
- Special event day timing
- Multi-location settings
- Location-based pricing

### 13. Room/Cabin/Chair Management
- Room master database
- Real-time room availability
- Automatic double-booking prevention
- 4-way mapping (Room + Employee + Time + Service)
- Room-specific pricing premiums
- Maintenance scheduling

### 14. Inventory & Product Management
- Complete product master database
- Real-time stock tracking
- Low stock alert system
- Vendor management
- Purchase order creation
- Product expiry tracking

### 15. Membership & Package Management
- Flexible membership plan creation
- Time-based and visit-based packages
- Auto-renewal with payment gateway
- Real-time membership usage tracking
- Family and group membership plans

### 16. Marketing & Communication Hub
- Built-in email marketing campaign builder
- SMS marketing campaign system
- WhatsApp Business API ready
- Web push notification system
- Campaign scheduling and automation
- Customer segmentation for targeting

### 17. Security & Data Protection
- Granular role-based access control
- Two-factor authentication (2FA)
- Industry-standard password encryption (bcrypt)
- Data encryption at rest and in transit
- Comprehensive activity audit logs
- GDPR compliance features

## Tech Stack

### Frontend
- React.js 18+ with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Recharts for data visualization
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- RESTful API architecture
- JWT authentication
- bcrypt for password hashing

### Database
- PostgreSQL (relational database)
- Comprehensive schema with 40+ tables

## Project Structure

```
app/
├── database/
│   └── schema.sql          # Complete PostgreSQL schema
├── src/
│   ├── components/         # Reusable components
│   │   ├── layout/         # Sidebar, Header
│   │   ├── common/         # Common UI components
│   │   └── notifications/  # Notification components
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── data/               # Mock data
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   │   ├── auth/           # Login, Register
│   │   ├── dashboard/      # Dashboard
│   │   ├── bookings/       # Booking management
│   │   ├── services/       # Service management
│   │   ├── employees/      # Employee management
│   │   ├── customers/      # Customer management
│   │   ├── crm/            # CRM dashboard
│   │   ├── loyalty/        # Loyalty program
│   │   ├── payments/       # Payment & billing
│   │   ├── inventory/      # Inventory management
│   │   ├── membership/     # Membership packages
│   │   ├── rooms/          # Room management
│   │   ├── attendance/     # Attendance tracking
│   │   ├── analytics/      # Analytics & reporting
│   │   ├── marketing/      # Marketing hub
│   │   ├── admin/          # Admin settings
│   │   ├── portal/         # Customer portal
│   │   ├── giftcards/      # Gift cards
│   │   ├── coupons/        # Coupons
│   │   ├── reports/        # Reports
│   │   └── integrations/   # Integrations
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create PostgreSQL database
createdb spabook_pro

# Run the schema
psql -d spabook_pro -f database/schema.sql
```

4. Configure environment variables:
```bash
# Create .env file
cp .env.example .env

# Edit .env with your settings
DATABASE_URL=postgresql://user:password@localhost:5432/spabook_pro
JWT_SECRET=your_jwt_secret
PORT=3000
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

### Default Login Credentials
- Email: admin@spabook.com
- Password: (any password works in demo mode)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Running Tests

```bash
npm test
```

## API Documentation

API documentation is available at `/api/docs` when running the development server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@spabook.com or join our Slack channel.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
