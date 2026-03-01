import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getPayments = async (req: AuthRequest, res: Response) => {
    try {
        const payments = await Payment.findAll({
            include: [{ model: Booking, as: 'booking' }],
            order: [['paymentDate', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

export const getMyPayments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const payments = await Payment.findAll({
            include: [{
                model: Booking,
                as: 'booking',
                where: { customerId: userId },
                required: true
            }],
            order: [['paymentDate', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your payments' });
    }
};

export const getMyPaymentStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const payments = await Payment.findAll({
            include: [{
                model: Booking,
                as: 'booking',
                where: { customerId: userId },
                required: true
            }]
        });

        const totalSpent = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const pendingAmount = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const totalTransactions = payments.length;
        const lastTransaction = payments.length > 0 ? payments[0].paymentDate : null;

        res.json({
            totalSpent,
            pendingAmount,
            totalTransactions,
            lastTransaction
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment stats' });
    }
};

export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const payment = await Payment.findByPk(parseInt(req.params.id as string), { include: [{ model: Booking, as: 'booking' }] });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment' });
    }
};

export const createPayment = async (req: Request, res: Response) => {
    try {
        const payment = await Payment.create(req.body);
        // Optionally update booking status if fully paid
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating payment', error });
    }
};
