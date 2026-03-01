import { Request, Response } from 'express';
import LoyaltyTier from '../models/LoyaltyTier';
import CustomerLoyalty from '../models/CustomerLoyalty';
import PointsTransaction from '../models/PointsTransaction';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// --- Tiers ---
export const getTiers = async (req: Request, res: Response) => {
    try {
        const tiers = await LoyaltyTier.findAll({ order: [['minSpent', 'ASC']] });
        res.json(tiers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tiers', error });
    }
};

export const createTier = async (req: Request, res: Response) => {
    try {
        const tier = await LoyaltyTier.create(req.body);
        res.status(201).json(tier);
    } catch (error) {
        res.status(400).json({ message: 'Error creating tier', error });
    }
};

export const updateTier = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        console.log(`[UPDATE_TIER] ID: ${id}, Body:`, req.body);
        const tier = await LoyaltyTier.findByPk(id);
        if (!tier) return res.status(404).json({ message: 'Tier not found' });

        await tier.update(req.body);
        console.log(`[UPDATE_TIER] Success. Updated Tier:`, tier.toJSON());
        res.json(tier);
    } catch (error) {
        res.status(400).json({ message: 'Error updating tier', error });
    }
};

export const deleteTier = async (req: Request, res: Response) => {
    try {
        const deleted = await LoyaltyTier.destroy({
            where: { id: parseInt(req.params.id as string) },
        });
        if (!deleted) return res.status(404).json({ message: 'Tier not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tier', error });
    }
};

// --- Customer Loyalty ---
export const getMyLoyalty = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        let loyalty = await CustomerLoyalty.findOne({
            where: { customerId: userId },
            include: [{ model: LoyaltyTier, as: 'tier' }]
        });

        if (!loyalty) {
            // Auto-create/initialize if missing
            const defaultTier = await LoyaltyTier.findOne({ order: [['minSpent', 'ASC']] });
            if (defaultTier) {
                loyalty = await CustomerLoyalty.create({
                    customerId: userId,
                    tierId: defaultTier.id,
                    currentPoints: 0,
                    totalPointsEarned: 0,
                    totalPointsRedeemed: 0,
                    totalSpent: 0
                });
                loyalty = await CustomerLoyalty.findOne({
                    where: { customerId: userId },
                    include: [{ model: LoyaltyTier, as: 'tier' }]
                });
            }
        }

        res.json(loyalty);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loyalty', error });
    }
};

export const getCustomerLoyalty = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id as string);
        const loyalty = await CustomerLoyalty.findOne({
            where: { customerId: userId },
            include: [{ model: LoyaltyTier, as: 'tier' }]
        });
        if (!loyalty) return res.status(404).json({ message: 'Loyalty profile not found' });
        res.json(loyalty);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loyalty' });
    }
};

export const getAllCustomerLoyalty = async (req: Request, res: Response) => {
    try {
        const loyalties = await CustomerLoyalty.findAll({
            include: [
                { model: LoyaltyTier, as: 'tier' },
                { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'id'] }
            ],
            order: [['currentPoints', 'DESC']]
        });
        res.json(loyalties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching member loyalties', error });
    }
};
export const adjustPoints = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id as string);
        const { points, reason } = req.body; // reason for logging if we had logs

        let loyalty = await CustomerLoyalty.findOne({ where: { customerId: userId } });
        if (!loyalty) {
            const defaultTier = await LoyaltyTier.findOne({ order: [['minSpent', 'ASC']] });
            loyalty = await CustomerLoyalty.create({
                customerId: userId,
                tierId: defaultTier?.id || 1,
                currentPoints: 0,
                totalPointsEarned: 0,
                totalPointsRedeemed: 0,
                totalSpent: 0
            });
        }

        const adjustment = parseInt(points);
        if (adjustment > 0) {
            loyalty.currentPoints += adjustment;
            loyalty.totalPointsEarned += adjustment;
        } else {
            loyalty.currentPoints = Math.max(0, loyalty.currentPoints + adjustment);
            if (adjustment < 0) loyalty.totalPointsRedeemed += Math.abs(adjustment);
        }

        // Tier upgrade logic removed at user request (non-tier-based loyalty)

        await PointsTransaction.create({
            customerId: userId,
            points: Math.abs(adjustment),
            type: adjustment > 0 ? 'adjusted' : 'redeemed',
            reason: reason || 'Manual adjustment'
        });

        await loyalty.save();
        res.json(loyalty);
    } catch (error) {
        res.status(500).json({ message: 'Error adjusting points', error });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await PointsTransaction.findAll({
            include: [{ model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'id'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        console.error('[LOYALTY_GET_TRANSACTIONS_ERROR]:', error);
        res.status(500).json({ message: 'Error fetching point transactions', error });
    }
};
