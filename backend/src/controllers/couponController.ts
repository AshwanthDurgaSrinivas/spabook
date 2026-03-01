import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: 'Error creating coupon', error });
    }
};

export const getCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons' });
    }
};

export const updateCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(parseInt(id as string, 10));
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

        await coupon.update(req.body);
        res.json(coupon);
    } catch (error) {
        res.status(400).json({ message: 'Error updating coupon', error });
    }
};

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(parseInt(id as string, 10));
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

        await coupon.destroy();
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coupon', error });
    }
};

export const validateCoupon = async (req: Request, res: Response) => {
    try {
        const { code, cartTotal } = req.body;
        const coupon = await Coupon.findOne({ where: { code, isActive: true } });

        if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });

        const now = new Date();
        const start = new Date(coupon.startDate);
        const end = new Date(coupon.endDate);
        if (now < start || now > end) {
            return res.status(400).json({ message: 'Coupon expired or not started' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded' });
        }

        // Check membership restrictions
        const customerId = (req as any).user?.id;
        if (coupon.membershipId || coupon.isMembersOnly) {
            if (!customerId) {
                return res.status(401).json({ message: 'Membership required to use this coupon' });
            }

            const activeMembership = await (sequelize.models.CustomerMembership as any).findOne({
                where: { customerId, status: 'active', endDate: { [Op.gte]: now } }
            });

            if (coupon.isMembersOnly && !activeMembership) {
                return res.status(400).json({ message: 'This coupon is for members only' });
            }

            if (coupon.membershipId && (!activeMembership || activeMembership.planId !== coupon.membershipId)) {
                return res.status(400).json({ message: 'This coupon is not valid for your membership level' });
            }
        }

        if (parseFloat(cartTotal) < parseFloat(coupon.minPurchaseAmount.toString())) {
            return res.status(400).json({ message: `Minimum purchase of ${coupon.minPurchaseAmount} required` });
        }

        let discount = 0;
        if (coupon.discountType === 'fixed_amount') {
            discount = parseFloat(coupon.value.toString());
        } else {
            discount = (parseFloat(cartTotal) * parseFloat(coupon.value.toString())) / 100;
            if (coupon.maxDiscountAmount && discount > parseFloat(coupon.maxDiscountAmount.toString())) {
                discount = parseFloat(coupon.maxDiscountAmount.toString());
            }
        }

        res.json({ valid: true, discount, coupon });
    } catch (error) {
        res.status(500).json({ message: 'Error validating coupon' });
    }
};
