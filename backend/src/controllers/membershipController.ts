import { Request, Response } from 'express';
import MembershipPlan from '../models/MembershipPlan';
import CustomerMembership from '../models/CustomerMembership';
import User from '../models/User';
import Setting from '../models/Setting';
import { AuthRequest } from '../middleware/authMiddleware';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { decrypt } from '../utils/encryption';

// --- Plans ---
export const getMemberships = async (req: Request, res: Response) => {
    try {
        const memberships = await MembershipPlan.findAll({ order: [['price', 'ASC']] });
        res.json(memberships);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memberships', error });
    }
};

export const getMembershipById = async (req: Request, res: Response) => {
    try {
        const membership = await MembershipPlan.findByPk(parseInt(req.params.id as string));
        if (!membership) return res.status(404).json({ message: 'Membership not found' });
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching membership', error });
    }
};

export const createMembership = async (req: Request, res: Response) => {
    try {
        const membership = await MembershipPlan.create(req.body);
        res.status(201).json(membership);
    } catch (error) {
        res.status(400).json({ message: 'Error creating membership', error });
    }
};

export const updateMembership = async (req: Request, res: Response) => {
    try {
        const [updated] = await MembershipPlan.update(req.body, {
            where: { id: parseInt(req.params.id as string) },
        });
        if (!updated) return res.status(404).json({ message: 'Membership not found' });
        const updatedMembership = await MembershipPlan.findByPk(parseInt(req.params.id as string));
        res.json(updatedMembership);
    } catch (error) {
        res.status(400).json({ message: 'Error updating membership', error });
    }
};

// --- Subscriptions ---
// --- Subscriptions with Razorpay ---
export const createMembershipOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { planId } = req.body;
        const customerId = req.user.id;

        const plan = await MembershipPlan.findByPk(planId);
        if (!plan) return res.status(404).json({ message: 'Membership plan not found' });

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

        const currencySetting = await Setting.findOne({ where: { key: 'currency' } });
        const currency = currencySetting ? currencySetting.value : 'USD';

        const options = {
            amount: Math.round(Number(plan.price) * 100),
            currency: currency,
            receipt: `rcpt_mb_${customerId}_${Date.now()}`,
            notes: {
                customerId,
                planId,
                type: 'membership_subscription'
            }
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (error) {
        console.error('Create Membership Order Error:', error);
        res.status(500).json({ message: 'Error creating payment order', error });
    }
};

export const verifyMembershipPayment = async (req: AuthRequest, res: Response) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId
        } = req.body;
        const customerId = req.user.id;

        const keySecretSetting = await Setting.findOne({ where: { key: 'razorpay_key_secret' } });
        if (!keySecretSetting) return res.status(500).json({ message: 'Credentials missing' });

        const secret = decrypt(keySecretSetting.value);

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            const plan = await MembershipPlan.findByPk(planId);
            if (!plan) return res.status(404).json({ message: 'Plan not found' });

            // Deactivate existing membership if any
            await CustomerMembership.update(
                { status: 'cancelled' },
                { where: { customerId, status: 'active' } }
            );

            const start = new Date();
            const end = new Date(start);
            end.setDate(end.getDate() + plan.durationDays);

            const subscription = await CustomerMembership.create({
                customerId,
                planId,
                startDate: start,
                endDate: end,
                status: 'active',
                autoRenew: true
            });

            res.json({
                status: 'success',
                message: 'Membership activated successfully!',
                subscription
            });
        } else {
            res.status(400).json({ status: 'failure', message: 'Signature verification failed' });
        }

    } catch (error) {
        console.error('Verify Membership Payment Error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

export const subscribeToPlan = async (req: AuthRequest, res: Response) => {
    // This is now legacy or can be used for internal assignments. 
    // Redirect to createMembershipOrder for frontend.
    res.status(400).json({ message: 'Use payment gateway endpoints for subscriptions' });
};

export const assignMembership = async (req: Request, res: Response) => {
    try {
        const { customerId, planId, startDate } = req.body;
        // Check if plan exists
        const plan = await MembershipPlan.findByPk(planId);
        if (!plan) return res.status(404).json({ message: 'Membership plan not found' });

        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + plan.durationDays);

        const subscription = await CustomerMembership.create({
            customerId,
            planId,
            startDate: start,
            endDate: end,
            status: 'active',
            autoRenew: true
        });
        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ message: 'Error assigning membership', error });
    }
};

export const getMyMembership = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user.id;
        const membership = await CustomerMembership.findOne({
            where: { customerId: id, status: 'active' },
            include: [{ model: MembershipPlan, as: 'plan' }]
        });
        if (!membership) return res.json(null);
        res.json(membership);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscription' });
    }
};

export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await CustomerMembership.findAll({
            include: [
                { model: MembershipPlan, as: 'plan' },
                { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'id'] }
            ],
            order: [['startDate', 'DESC']]
        });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscriptions', error });
    }
};

export const cancelMyMembership = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.user.id;
        const membership = await CustomerMembership.findOne({
            where: { customerId: id, status: 'active' }
        });

        if (!membership) {
            return res.status(404).json({ message: 'No active membership found to cancel' });
        }

        await membership.update({ status: 'cancelled', autoRenew: false });

        res.json({ message: 'Membership cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling subscription' });
    }
};

export const deleteMembership = async (req: Request, res: Response) => {
    try {
        const deleted = await MembershipPlan.destroy({
            where: { id: parseInt(req.params.id as string) },
        });
        if (!deleted) return res.status(404).json({ message: 'Membership not found' });
        res.json({ message: 'Membership plan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting membership', error });
    }
};
