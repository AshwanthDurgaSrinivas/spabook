
import { Request, Response } from 'express';
import Setting from '../models/Setting';
import { AuthRequest } from '../middleware/authMiddleware';
import { encrypt, decrypt } from '../utils/encryption';
import Razorpay from 'razorpay';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import crypto from 'crypto';
import { Op } from 'sequelize';

import nodemailer from 'nodemailer';

// Get Razorpay Keys for Admin (Show masked or placeholders)
export const getSettings = async (req: AuthRequest, res: Response) => {
    try {
        const settings = await Setting.findAll();
        // Mask keys on retrieval
        const masked = settings.map(s => ({
            ...s.toJSON(),
            value: (s.key.includes('_key_secret') || s.key.includes('_password')) ? '************' : s.value
        }));
        res.json(masked);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

export const testSMTPConnection = async (req: AuthRequest, res: Response) => {
    try {
        const { host, port, user, password, secure, fromEmail } = req.body;

        const transporter = nodemailer.createTransport({
            host,
            port: parseInt(port),
            secure: secure === true || secure === 'true',
            auth: {
                user,
                pass: password === '************' ? await (async () => {
                    const setting = await Setting.findOne({ where: { key: 'smtp_password' } });
                    return setting ? decrypt(setting.value) : '';
                })() : password
            },
            tls: { rejectUnauthorized: false }
        });

        await transporter.verify();

        res.json({ success: true, message: 'SMTP connection successful!' });
    } catch (error: any) {
        console.error('SMTP Test Error:', error);
        res.status(500).json({ success: false, message: 'SMTP connection failed: ' + error.message });
    }
};

// Update Settings
export const updateSetting = async (req: AuthRequest, res: Response) => {
    try {
        const { key, value } = req.body;
        // Check if sensitive
        const isSensitive = key.includes('_secret') || key.includes('_password');

        let storedValue = value;
        if (isSensitive && value !== '************') {
            storedValue = encrypt(value);
        } else if (value === '************') {
            // Keep existing
            return res.json({ message: 'Setting unchanged' });
        }

        const [setting, created] = await Setting.findOrCreate({
            where: { key },
            defaults: { value: storedValue, isEncrypted: isSensitive }
        });

        if (!created) {
            setting.value = storedValue;
            setting.isEncrypted = isSensitive;
            await setting.save();
        }

        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating setting' });
    }
};

// Get Public Razorpay Key for Frontend
export const getRazorpayKeyId = async (req: Request, res: Response) => {
    try {
        const setting = await Setting.findOne({ where: { key: 'razorpay_key_id' } });
        if (!setting) return res.status(404).json({ message: 'Razorpay Key ID not configured' });
        res.json({ keyId: setting.value });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching key' });
    }
};

// Create Razorpay Order
export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, bookingId, currency = 'USD' } = req.body;

        const keyIdSetting = await Setting.findOne({ where: { key: 'razorpay_key_id' } });
        const keySecretSetting = await Setting.findOne({ where: { key: 'razorpay_key_secret' } });

        if (!keyIdSetting || !keySecretSetting) {
            return res.status(500).json({ message: 'Razorpay credentials not configured' });
        }

        const secret = decrypt(keySecretSetting.value);
        const razorpay = new Razorpay({
            key_id: keyIdSetting.value,
            key_secret: secret,
        });

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency,
            receipt: `rcpt_${bookingId}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Error creating Razorpay order', error });
    }
};

// Verify Payment
export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const keySecretSetting = await Setting.findOne({ where: { key: 'razorpay_key_secret' } });
        if (!keySecretSetting) return res.status(500).json({ message: 'Credentials missing' });

        const secret = decrypt(keySecretSetting.value);

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            const booking = await Booking.findByPk(bookingId);
            if (booking) {
                booking.paymentStatus = 'paid';
                booking.status = 'confirmed';
                await booking.save();

                await Payment.create({
                    bookingId,
                    amount: booking.totalAmount,
                    method: 'online',
                    status: 'completed',
                    transactionId: razorpay_payment_id,
                    paymentDate: new Date()
                });
            }
            res.json({ status: 'success', message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ status: 'failure', message: 'Signature verification failed' });
        }

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

// Get Public Business Settings (Name, Phone, Tax, Gateways)
export const getPublicSettings = async (req: Request, res: Response) => {
    try {
        const publicKeys = [
            'business_name', 'business_email', 'business_phone', 'business_address',
            'default_payment_gateway', 'tax_rate', 'currency', 'timezone',
            'allow_same_day_booking', 'enable_waitlist', 'guest_checkout',
            'stripe_publishable_key', 'paypal_client_id', 'weekly_schedule',
            'allow_discount_combination',
            'allow_coupon_loyalty_combination',
            'loyalty_points_earn_ratio',
            'loyalty_points_redeem_ratio',
            'loyalty_min_bill_redemption',
            'allow_pay_at_venue'
        ];

        const settings = await Setting.findAll({
            where: { key: { [Op.in]: publicKeys } } as any
        });

        const result: Record<string, string> = {};
        settings.forEach(s => {
            result[s.key] = s.value;
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public settings' });
    }
};
