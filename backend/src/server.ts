import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import passport from './config/passport';
import { initializeDatabase, sequelize } from './config/database';

import routes from './routes';
import User from './models/User';
import ServiceCategory from './models/ServiceCategory';
import Service from './models/Service';
import Employee from './models/Employee';
import Booking from './models/Booking';
import Room from './models/Room';
import RoomBlock from './models/RoomBlock';
import Product from './models/Product';
import MembershipPlan from './models/MembershipPlan';
import CustomerMembership from './models/CustomerMembership';
import Payment from './models/Payment';
import CustomerLoyalty from './models/CustomerLoyalty';
import PointsTransaction from './models/PointsTransaction';
import LoyaltyTier from './models/LoyaltyTier';
import Attendance from './models/Attendance';
import Coupon from './models/Coupon';
import Campaign from './models/Campaign';
import EmailTemplate from './models/EmailTemplate';
import MarketingAutomation from './models/MarketingAutomation';
import Setting from './models/Setting';
import Contact from './models/Contact';
import Package from './models/Package';
import Report from './models/Report';
import Notification from './models/Notification';
import Tax from './models/Tax';
import GeofenceLocation from './models/GeofenceLocation';
import BundleItem from './models/BundleItem';
import GalleryItem from './models/GalleryItem';
import Leave from './models/Leave';
import PricingRule from './models/PricingRule';

import bcrypt from 'bcryptjs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { provisionRoomsForService } from './services/roomProvisioner';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
    });
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'spabook-session-secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Static folder for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Global Error Handler]:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
const startServer = async () => {
    try {
        await initializeDatabase();

        // Sync models
        await sequelize.sync();
        console.log('Database synced with alter: true.');
        console.log('Server Logic Updated: Spend-Based Loyalty v2.1');

        // Seed Data
        const userCount = await User.count();
        if (userCount === 0) {
            console.log('Seeding initial data...');

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('1234', salt);

            const users = await User.bulkCreate([
                {
                    status: 'active',
                    email: 'admin@spabook.com',
                    passwordHash,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'admin'
                } as any,
                {
                    status: 'active',
                    email: 'manager@spabook.com',
                    passwordHash,
                    firstName: 'Manager',
                    lastName: 'User',
                    role: 'manager'
                } as any,
                {
                    status: 'active',
                    email: 'customer@spabook.com',
                    passwordHash,
                    firstName: 'Customer',
                    lastName: 'User',
                    role: 'customer'
                } as any,
                {
                    status: 'active',
                    email: 'therapist@spabook.com',
                    passwordHash,
                    firstName: 'Therapist',
                    lastName: 'User',
                    role: 'employee'
                } as any
            ]);
            console.log('Users seeded.');



            // Seed Service Categories
            const category = await ServiceCategory.create({
                name: 'Massage',
                slug: 'massage',
                description: 'Relaxing massages',
                displayOrder: 1,
                isActive: true,
                icon: 'Sparkles'
            } as any);

            // Seed Services
            await Service.create({
                categoryId: category.id,
                name: 'Swedish Massage',
                slug: 'swedish-massage',
                description: 'Classic relaxing massage',
                shortDescription: 'Relaxing',
                durationMinutes: 60,
                basePrice: 80.00,
                taxRate: 5.00,
                isActive: true,
                imageUrls: []
            } as any);

            // Seed Marketing Data
            await EmailTemplate.create({
                name: 'Welcome Email',
                slug: 'welcome-email',
                subject: 'Welcome to SpaBook Pro!',
                bodyHtml: '<h1>Welcome!</h1><p>We are glad to have you.</p>',
                variables: ['firstName', 'lastName'],
                isActive: true
            } as any);

            await Campaign.create({
                name: 'Summer Sale',
                campaignType: 'email',
                description: 'Annual summer discount',
                segmentCriteria: { segment: 'all' },
                status: 'sent',
                totalRecipients: 100,
                totalSent: 100,
                totalDelivered: 98,
                totalOpened: 45,
                totalClicked: 12
            } as any);

            await MarketingAutomation.create({
                name: 'Welcome Series',
                trigger: 'Customer Signup',
                isActive: true,
                totalSends: 156,
                totalOpens: 89,
                totalClicks: 23,
                configuration: { steps: 3 }
            } as any);

            // Seed Categories and Services
            const massageCategory = await ServiceCategory.create({
                name: 'Massage Therapy',
                displayOrder: 1,
                isActive: true
            } as any);

            const facialCategory = await ServiceCategory.create({
                name: 'Skin Care',
                displayOrder: 2,
                isActive: true
            } as any);

            await Service.bulkCreate([
                {
                    categoryId: massageCategory.id,
                    name: 'Swedish Massage',
                    slug: 'swedish-massage',
                    shortDescription: 'Relaxing full body massage',
                    durationMinutes: 60,
                    basePrice: 90.00,
                    isActive: true
                },
                {
                    categoryId: massageCategory.id,
                    name: 'Deep Tissue Massage',
                    slug: 'deep-tissue-massage',
                    shortDescription: 'Therapeutic firm pressure',
                    durationMinutes: 90,
                    basePrice: 130.00,
                    isActive: true
                },
                {
                    categoryId: facialCategory.id,
                    name: 'Organic Glow Facial',
                    slug: 'organic-glow-facial',
                    shortDescription: 'Revitalizing skin treatment',
                    durationMinutes: 45,
                    basePrice: 75.00,
                    isActive: true
                }
            ] as any[]);

            // Seed Packages
            await Package.bulkCreate([
                {
                    name: "Ultimate Stress Relief",
                    description: "A comprehensive massage experience for total body relaxation.",
                    price: 295,
                    originalPrice: 340,
                    duration: "2.5 hours",
                    features: ["90min Signature Massage", "Hot Stone Therapy Add-on", "Foot Reflexology", "Scalp Massage"],
                    isPopular: true,
                    isActive: true
                },
                {
                    name: "Couples Retreat",
                    description: "Perfect for anniversaries or a romantic getaway.",
                    price: 350,
                    originalPrice: 400,
                    duration: "90 mins",
                    features: ["60min Couples Massage", "Private Suite", "Champagne & Strawberries", "Aromatherapy Upgrade"],
                    isPopular: false,
                    isActive: true
                },
                {
                    name: "Expectant Mother Restore",
                    description: "Gentle pampering for moms-to-be.",
                    price: 195,
                    originalPrice: 225,
                    duration: "90 mins",
                    features: ["60min Prenatal Massage", "Soothing Foot Soak", "Leg & Foot Massage", "Relaxation Time"],
                    isPopular: false,
                    isActive: true
                }
            ] as any[]);
        }

        // --- Ensure Employee Profiles for all staff (even if seeded before) ---
        const staffUsers = await User.findAll({
            where: {
                role: ['admin', 'manager', 'employee', 'super_admin']
            },
            raw: true
        });

        for (const user of staffUsers) {
            await Employee.findOrCreate({
                where: { email: user.email },
                defaults: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    department: user.role === 'admin' || user.role === 'super_admin' ? 'Management' : 'Service',
                    designation: user.role.toUpperCase(),
                    commissionRate: 0,
                    hourlyRate: 0,
                    passwordHash: user.passwordHash,
                    role: user.role === 'admin' || user.role === 'super_admin' || user.role === 'manager' ? user.role : 'employee',
                    status: 'active',
                    geofenceBypass: true
                } as any
            });
        }
        console.log('Checked and ensured employee profiles for all staff accounts.');

        // --- Persistent Loyalty Program Seeding (Non-Tiered) ---
        const baseRule = { name: 'Loyalty Member', minSpent: 0, earnRatio: 1.0, redeemValue: 0.1, minBillForRedemption: 50.0, color: '#f97316', isActive: true, description: 'Global loyalty program' };

        // Ensure we have at least one program rule record
        const [tier1, created] = await LoyaltyTier.findOrCreate({
            where: { id: 1 },
            defaults: baseRule as any
        });

        if (!created && (!tier1.earnRatio || Number(tier1.minBillForRedemption) === 0)) {
            await tier1.update(baseRule);
        }

        // Migration: Point all customers to the default program and remove higher tiers
        await CustomerLoyalty.update({ tierId: 1 }, { where: {} });
        const { Op } = await import('sequelize');
        await LoyaltyTier.destroy({ where: { id: { [Op.gt]: 1 } } });
        console.log('Loyalty Program consolidated to single global rule set.');

        // --- SMTP Settings Seeding ---
        if (process.env.SMTP_HOST) {
            const { encrypt } = await import('./utils/encryption');
            const smtpConfigs = [
                { key: 'smtp_host', value: process.env.SMTP_HOST, isEncrypted: false },
                { key: 'smtp_port', value: process.env.SMTP_PORT || '587', isEncrypted: false },
                { key: 'smtp_user', value: process.env.SMTP_USER || '', isEncrypted: false },
                { key: 'smtp_password', value: process.env.SMTP_PASS ? encrypt(process.env.SMTP_PASS) : '', isEncrypted: true },
                { key: 'smtp_secure', value: process.env.SMTP_SECURE || 'false', isEncrypted: false },
                { key: 'smtp_from_email', value: process.env.EMAIL_FROM_ADDRESS || 'noreply@sparklebeauty.com', isEncrypted: false },
                { key: 'smtp_from_name', value: process.env.EMAIL_FROM_NAME || 'Sparkle Beauty Lounge', isEncrypted: false }
            ];

            for (const config of smtpConfigs) {
                await Setting.findOrCreate({
                    where: { key: config.key },
                    defaults: config
                });
            }
            console.log('SMTP configuration seeded from environment variables.');
        }

        // --- FAQ Seeding ---
        const faqCount = await (await import('./models/FAQ')).default.count();
        if (faqCount === 0) {
            await (await import('./models/FAQ')).default.bulkCreate([
                {
                    question: "How do I reset my password?",
                    answer: "Go to the login page and click 'Forgot Password'. Follow the email instructions to reset your password.",
                    category: "Account"
                },
                {
                    question: "How can I add a new employee?",
                    answer: "Navigate to the Employees page from the sidebar, then click the '+ Add Employee' button in the top right corner.",
                    category: "Admin"
                },
                {
                    question: "Can I export my booking data?",
                    answer: "Yes, go to the Reports page or the Bookings page and look for the 'Export' button to download your data as CSV or PDF.",
                    category: "Admin"
                }
            ]);
            console.log('Initial FAQs seeded.');
        }

        // --- Business Settings (Footer, etc.) Seeding ---
        const businessSettings = [
            { key: 'business_address', value: '123 Beauty Lane, Suite 100, New York, NY 10001', description: 'Physical address of the shop' },
            { key: 'business_phone', value: '+1 (555) 123-4567', description: 'Primary contact phone' },
            { key: 'business_email', value: 'hello@sparklebeauty.com', description: 'Primary contact email' },
            { key: 'social_instagram', value: 'https://instagram.com/sparklebeauty', description: 'Instagram profile link' },
            { key: 'social_facebook', value: 'https://facebook.com/sparklebeauty', description: 'Facebook profile link' },
            { key: 'social_twitter', value: 'https://twitter.com/sparklebeauty', description: 'Twitter profile link' },
            { key: 'hours_mon_fri', value: '9:00 AM - 8:00 PM', description: 'Opening hours Weekdays' },
            { key: 'hours_sat', value: '10:00 AM - 6:00 PM', description: 'Opening hours Saturday' },
            { key: 'hours_sun', value: '11:00 AM - 5:00 PM', description: 'Opening hours Sunday' }
        ];

        for (const s of businessSettings) {
            await Setting.findOrCreate({
                where: { key: s.key },
                defaults: s
            });
        }


        // ── AUTO-PROVISION ROOMS ────────────────────────────────────────────────
        // Rooms are provisioned PER SERVICE, not per category.
        // 5 services × capacity = correct total rooms, zero cross-contamination.
        try {
            console.log('Auto-provisioning rooms for all services...');

            // Remove orphan rooms (serviceId IS NULL) that have no active bookings
            const { Op: SeqOp } = await import('sequelize');
            const unlinked = await Room.findAll({ where: { serviceId: null } });
            for (const r of unlinked) {
                const hasBkg = await Booking.findOne({
                    where: { roomId: r.id, status: { [SeqOp.notIn]: ['cancelled', 'completed'] } }
                });
                if (!hasBkg) await r.destroy();
            }

            // Provision rooms for every service
            const allServices = await Service.findAll();
            for (const svc of allServices) {
                const cap = Number(svc.capacity) || 1;
                await provisionRoomsForService(svc.id, svc.name, svc.categoryId ?? null, cap);
            }
            console.log(`Room provisioning complete: ${allServices.length} service(s) processed.`);
        } catch (provErr) {
            console.error('Room provisioning failed (non-fatal):', provErr);
        }
        // ────────────────────────────────────────────────────────────────────────


        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Backend server active. Version: Phone-Fix-v2.2');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();

/ /   t r i g g e r  
 