import { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import Employee from '../models/Employee';
import Service from '../models/Service';
import Room from '../models/Room';
import RoomBlock from '../models/RoomBlock';
import ServiceCategory from '../models/ServiceCategory';
import PricingRule from '../models/PricingRule';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/authMiddleware';
import { notificationService } from '../services/notificationService';
import CustomerMembership from '../models/CustomerMembership';
import MembershipPlan from '../models/MembershipPlan';
import Tax from '../models/Tax';
import Package from '../models/Package';
import Coupon from '../models/Coupon';
import Setting from '../models/Setting';
import CustomerLoyalty from '../models/CustomerLoyalty';
import PointsTransaction from '../models/PointsTransaction';
import LoyaltyTier from '../models/LoyaltyTier';

const calculateDynamicPrice = async (serviceId: number, basePrice: number, date: string, startTime: string) => {
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    const rules = await PricingRule.findAll({
        where: {
            isActive: true,
            [Op.or]: [
                { serviceId: serviceId },
                { serviceId: null }
            ]
        },
        order: [['priority', 'DESC']]
    });

    let finalPrice = Number(basePrice);

    for (const rule of rules) {
        if (rule.daysOfWeek.includes(dayOfWeek)) {
            if (startTime >= rule.startTime && startTime <= rule.endTime) {
                if (rule.adjustmentType === 'fixed') {
                    finalPrice += Number(rule.adjustmentValue);
                } else if (rule.adjustmentType === 'percentage') {
                    finalPrice *= (1 + Number(rule.adjustmentValue) / 100);
                }
                break;
            }
        }
    }

    return finalPrice;
};

export const getBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { role, id } = req.user as any;
        let whereClause = {};

        if (role === 'customer') {
            whereClause = { customerId: id };
        } else if (role === 'therapist' || role === 'employee') {
            // Find the employee record first
            const employee = await Employee.findOne({
                where: {
                    [Op.or]: [
                        { id: id },
                        { email: (req.user as any).email || '' }
                    ]
                }
            });
            if (employee) {
                whereClause = { employeeId: employee.id };
            } else {
                // If it's a manager/admin without an employee record, they still see all
                if (!['admin', 'manager', 'receptionist', 'super_admin'].includes(role)) {
                    whereClause = { employeeId: -1 }; // Hide everything
                }
            }
        }
        // Admin, Manager, and Receptionist see all bookings

        const bookings = await Booking.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email'] },
                { model: Employee, as: 'therapist', attributes: ['firstName', 'lastName'] },
                { model: Service, as: 'service', attributes: ['name', 'durationMinutes', 'basePrice'] },
                { model: Package, as: 'package', attributes: ['name', 'duration', 'price'] },
                { model: Room, as: 'room', attributes: ['name'] },
            ],
            order: [['id', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
    try {
        const booking = await Booking.findByPk(parseInt(req.params.id as string), {
            include: [
                { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'phone'] },
                {
                    model: Employee,
                    as: 'therapist',
                    attributes: ['id', 'firstName', 'lastName', 'profileImage'],
                },
                { model: Service, as: 'service' },
                { model: Package, as: 'package' },
                { model: Room, as: 'room', attributes: ['id', 'name', 'type'] },
            ],
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Access control
        if ((req.user as any).role === 'customer' && booking.customerId !== (req.user as any).id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error });
    }
};

// Helper to parse duration string (e.g., "2 hrs", "90 mins") into minutes
const parseDuration = (durationStr: string): number => {
    if (!durationStr) return 60;
    const lower = durationStr.toLowerCase();

    // Handle "X hr Y min" format
    const hrMatch = lower.match(/(\d+)\s*(hr|hour)/);
    const minMatch = lower.match(/(\d+)\s*(min)/);

    let total = 0;
    if (hrMatch) total += parseInt(hrMatch[1]) * 60;
    if (minMatch) total += parseInt(minMatch[1]);

    if (total > 0) return total;

    // Fallback to simple number
    const val = parseInt(lower);
    if (!isNaN(val)) {
        if (lower.includes('hr') || lower.includes('hour')) return val * 60;
        return val;
    }

    return 60;
};

// Helper to add minutes to HH:MM time string
const addMinutes = (time: string, mins: number): string => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + (mins || 0));
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}:00`;
};

export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        let { serviceId, packageId, employeeId, roomId, bookingDate, startTime } = req.body;

        if (!serviceId && !packageId) {
            return res.status(400).json({ message: 'Service or Package is required' });
        }

        // Ensure startTime has seconds if it doesn't
        if (startTime && startTime.split(':').length === 2) {
            startTime = `${startTime}:00`;
        }

        let totalDuration = 0;
        let basePrice = 0;
        let categorySlug = '';
        let targetServiceIds: number[] = [];

        if (serviceId) {
            const service = await Service.findByPk(serviceId, {
                include: [{ model: ServiceCategory }]
            });
            if (!service) return res.status(404).json({ message: 'Service not found' });
            totalDuration = service.durationMinutes;
            basePrice = Number(service.basePrice);
            categorySlug = (service as any).ServiceCategory?.slug;
            targetServiceIds = [serviceId];
        } else if (packageId) {
            const pkg = await Package.findByPk(packageId);
            if (!pkg) return res.status(404).json({ message: 'Package not found' });
            totalDuration = parseDuration(pkg.duration);
            basePrice = Number(pkg.price);
            targetServiceIds = pkg.serviceIds || [];
            if (targetServiceIds.length > 0) {
                const firstService = await Service.findByPk(targetServiceIds[0], {
                    include: [{ model: ServiceCategory }]
                });
                categorySlug = (firstService as any)?.ServiceCategory?.slug;
            }
        }

        // Prevent booking in the past
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISO = new Date(now.getTime() - offset).toISOString();
        const localISODate = localISO.split('T')[0];
        const localISOTime = localISO.split('T')[1].slice(0, 8); // Includes seconds

        if (bookingDate < localISODate) {
            return res.status(400).json({ message: 'Cannot book appointments in the past' });
        }

        if (bookingDate === localISODate) {
            const compareStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
            if (compareStartTime < localISOTime) {
                return res.status(400).json({ message: 'Cannot book appointments for a time that has already passed' });
            }
        }

        const endTime = addMinutes(startTime, totalDuration);

        // ── CAPACITY & DUPLICATE GUARD ──────────────────────────────────────────
        const customerId = req.body.customerId || (req.user as any).id;
        if (!customerId) return res.status(400).json({ message: 'Customer information is required' });

        const customerDuplicate = await Booking.findOne({
            where: {
                customerId,
                bookingDate,
                status: { [Op.notIn]: ['cancelled', 'completed'] },
                [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]
            }
        });
        if (customerDuplicate) {
            return res.status(409).json({ message: 'A booking already exists for this customer at the selected date and time.' });
        }

        // 2. Enforce service capacity
        for (const sid of targetServiceIds) {
            const s = await Service.findByPk(sid);
            if (!s) continue;
            const cap = Number(s.capacity) || 1;

            const activeBookings = await Booking.findAll({
                where: {
                    bookingDate,
                    status: { [Op.notIn]: ['cancelled', 'completed'] },
                    [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]
                },
                include: [{ model: Package, as: 'package' }]
            });

            let taken = 0;
            for (const b of activeBookings) {
                if (b.serviceId === sid) taken++;
                else if (b.packageId && (b as any).package?.serviceIds?.includes(sid)) taken++;
            }

            if (taken >= cap) {
                return res.status(409).json({ message: `Service '${s.name}' is fully booked for the selected time.` });
            }
        }

        let finalPrice = basePrice;
        if (serviceId) {
            const adjustedPrice = await calculateDynamicPrice(serviceId, basePrice, bookingDate, startTime);
            finalPrice = isNaN(adjustedPrice) ? basePrice : adjustedPrice;
        }

        // Determine discounts
        const activeMembership = await (CustomerMembership as any).findOne({
            where: { customerId, status: 'active', endDate: { [Op.gte]: bookingDate } },
            include: [{ model: MembershipPlan, as: 'plan' }]
        });
        // Fetch admin settings for discount combinations
        const comboSettings = await Setting.findAll({
            where: {
                key: ['allow_discount_combination', 'allow_coupon_loyalty_combination']
            }
        });
        const allowMemCoupCombo = comboSettings.find(s => s.key === 'allow_discount_combination')?.value === 'true';
        const allowCoupLoyaltyCombo = comboSettings.find(s => s.key === 'allow_coupon_loyalty_combination')?.value === 'true';

        // Calculate membership discount amount
        let membershipDiscountAmount = 0;
        if (activeMembership && (activeMembership as any).plan) {
            const discountPercent = Number((activeMembership as any).plan.discountPercentage) || 0;
            if (discountPercent > 0) {
                membershipDiscountAmount = finalPrice * (discountPercent / 100);
            }
        }
        // Calculate coupon discount amount
        let couponDiscountAmount = 0;
        const { couponCode, useLoyaltyPoints, paymentMethod } = req.body;
        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true } });
            if (coupon) {
                // Check membership restrictions
                const userHasActiveMembership = !!activeMembership;
                const userMembershipPlanId = activeMembership?.plan?.id;

                let isApplicable = true;

                if (coupon.isMembersOnly && !userHasActiveMembership) {
                    isApplicable = false;
                } else if (coupon.membershipId && userMembershipPlanId !== coupon.membershipId) {
                    isApplicable = false;
                }

                if (isApplicable) {
                    // Apply coupon discount
                    if (coupon.discountType === 'percentage') {
                        couponDiscountAmount = finalPrice * (coupon.value / 100);
                    } else {
                        couponDiscountAmount = coupon.value;
                    }
                }
            }
        }

        // Apply Membership vs Coupon combination rules
        let totalPromoDiscount = 0;
        if (allowMemCoupCombo) {
            totalPromoDiscount = membershipDiscountAmount + couponDiscountAmount;
        } else {
            // Only the larger discount applies
            if (membershipDiscountAmount >= couponDiscountAmount) {
                totalPromoDiscount = membershipDiscountAmount;
                couponDiscountAmount = 0; // Disable coupon for later combo check if it wasn't the main discount
            } else {
                totalPromoDiscount = couponDiscountAmount;
                membershipDiscountAmount = 0;
            }
        }

        // Ensure discount does not exceed price
        totalPromoDiscount = Math.min(finalPrice, totalPromoDiscount);
        finalPrice = finalPrice - totalPromoDiscount;

        // ── LOYALTY POINTS REDEMPTION ─────────────────────────────────────
        let loyaltyDiscountAmount = 0;
        let pointsToRedeem = 0;

        if (useLoyaltyPoints && customerId) {
            // Get customer loyalty and tier details
            const customerLoyalty = await CustomerLoyalty.findOne({
                where: { customerId },
                include: [{ model: LoyaltyTier, as: 'tier' }]
            });

            if (customerLoyalty && (customerLoyalty as any).tier) {
                const tier = (customerLoyalty as any).tier;
                const redeemRatio = parseFloat(tier.redeemValue || '0.1');
                const minBill = parseFloat(tier.minBillForRedemption || '50');

                // Check if combination with coupon is allowed
                if (allowCoupLoyaltyCombo || !couponDiscountAmount) {
                    // Check min bill against subtotal (finalPrice before loyalty but after other discounts)
                    if (finalPrice + totalPromoDiscount >= minBill) {
                        if (customerLoyalty.currentPoints > 0) {
                            const maxRedeemablePoints = Math.floor(finalPrice / redeemRatio);
                            pointsToRedeem = Math.min(customerLoyalty.currentPoints, maxRedeemablePoints);
                            loyaltyDiscountAmount = pointsToRedeem * redeemRatio;

                            finalPrice -= loyaltyDiscountAmount;

                            // Deduct points
                            customerLoyalty.currentPoints -= pointsToRedeem;
                            customerLoyalty.totalPointsRedeemed += pointsToRedeem;
                            await customerLoyalty.save();

                            await PointsTransaction.create({
                                customerId,
                                points: pointsToRedeem,
                                type: 'redeemed',
                                reason: 'Redeemed during booking'
                            });
                        }
                    }
                }
            }
        }

        // Employee assignment
        if (!employeeId) {
            const allTherapists = await Employee.findAll({ where: { role: 'therapist', status: 'active' } });
            let candidates = allTherapists;
            if (categorySlug) {
                candidates = allTherapists.filter(emp => {
                    const skills = emp.skills as any;
                    return skills && skills[categorySlug] && skills[categorySlug] > 0;
                });
                if (candidates.length === 0) candidates = allTherapists;
            }

            const availableCandidates = [];
            for (const candidate of candidates) {
                const conflict = await Booking.findOne({
                    where: {
                        employeeId: candidate.id,
                        bookingDate,
                        status: { [Op.notIn]: ['cancelled', 'completed'] },
                        [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]
                    }
                });
                if (!conflict) availableCandidates.push(candidate);
            }

            if (availableCandidates.length === 0) return res.status(409).json({ message: 'No therapists available at this time' });
            availableCandidates.sort((a, b) => ((b.skills as any)?.[categorySlug] || 0) - ((a.skills as any)?.[categorySlug] || 0));
            employeeId = availableCandidates[0].id;
        } else {
            const conflict = await Booking.findOne({
                where: {
                    employeeId,
                    bookingDate,
                    status: { [Op.notIn]: ['cancelled', 'completed'] },
                    [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]
                }
            });
            if (conflict) return res.status(409).json({ message: 'Therapist is not available at this time' });
        }

        // Room assignment
        if (!roomId) {
            const roomWhere: any = { status: { [Op.notIn]: ['maintenance', 'cleaning'] } };
            const availableRooms = await Room.findAll({ where: roomWhere, order: [['roomNumber', 'ASC']] });
            for (const room of availableRooms) {
                const roomBusy = await Booking.findOne({
                    where: {
                        roomId: room.id,
                        bookingDate,
                        status: { [Op.notIn]: ['cancelled', 'completed'] },
                        [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]
                    }
                });
                if (!roomBusy) {
                    roomId = room.id;
                    break;
                }
            }
        } else {
            const conflict = await Booking.findOne({
                where: {
                    roomId,
                    bookingDate,
                    status: { [Op.notIn]: ['cancelled', 'completed'] },
                    [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]
                }
            });
            if (conflict) return res.status(409).json({ message: 'Room is not available at this time' });
        }

        if (!roomId) return res.status(409).json({ message: 'All treatment rooms are occupied at the selected time.' });

        // Ensure finalPrice is a valid number
        let safeFinalPrice = Number(finalPrice);
        if (isNaN(safeFinalPrice)) {
            console.error('Invalid finalPrice detected:', finalPrice);
            safeFinalPrice = Number(basePrice) || 0;
        }

        // Tax calculation
        const activeTaxes = await Tax.findAll({ where: { isActive: true } });
        let totalTaxAmount = 0;
        const taxesDetail = activeTaxes.map(tax => {
            const rate = Number(tax.rate) || 0;
            const amount = safeFinalPrice * (rate / 100);
            totalTaxAmount += amount;
            return { name: tax.name, rate: rate, amount: Number(amount.toFixed(2)) };
        });

        const lastBooking = await Booking.findOne({ order: [['id', 'DESC']] });
        const bookingNumber = `APT-${1000 + (lastBooking?.id || 0) + 1}`;

        const totalAmount = Number((safeFinalPrice + totalTaxAmount).toFixed(2));

        const bookingData = {
            customerId: Number(customerId),
            employeeId: employeeId ? Number(employeeId) : null,
            serviceId: serviceId ? Number(serviceId) : null,
            packageId: packageId ? Number(packageId) : null,
            roomId: Number(roomId),
            bookingDate,
            startTime,
            endTime,
            totalPrice: Number(safeFinalPrice.toFixed(2)),
            totalAmount: isNaN(totalAmount) ? Number(safeFinalPrice.toFixed(2)) : totalAmount,
            taxes: taxesDetail,
            bookingNumber,
            status: (req.user as any).role === 'customer' ? 'pending' : 'confirmed',
            paymentStatus: paymentMethod === 'store' ? 'pending' : 'pending',
            pointsRedeemed: pointsToRedeem
        };

        console.log('Attempting to create booking with data:', JSON.stringify(bookingData, null, 2));

        const booking = await Booking.create(bookingData as any);

        const fullBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: User, as: 'customer' },
                { model: Service, as: 'service' },
                { model: Package, as: 'package' }
            ]
        });

        if (fullBooking) notificationService.sendBookingConfirmation(fullBooking).catch(err => console.error('Failed to send confirmation', err));

        res.status(201).json({
            message: 'Booking created successfully',
            booking,
            loyalty: {
                earned: 0, // Points are now earned only after completion
                used: pointsToRedeem,
                discount: loyaltyDiscountAmount
            }
        });
    } catch (error: any) {
        console.error('Booking Creation Failed Stack:', error);
        res.status(400).json({
            message: 'Error creating booking',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: error.errors ? error.errors.map((e: any) => e.message) : (error.original ? error.original.message : undefined)
        });
    }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByPk(parseInt(req.params.id as string));
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const user = req.user as any;

        // Access Control
        if (user.role === 'customer') {
            if (booking.customerId !== user.id) {
                return res.status(403).json({ message: 'Forbidden: You can only update your own bookings' });
            }
            // Customers can only cancel
            if (status !== 'cancelled') {
                return res.status(403).json({ message: 'Forbidden: Customers can only cancel their own bookings' });
            }
        }

        const oldStatus = booking.status;
        booking.status = status;
        await booking.save();

        // ── LOYALTY POINTS EARNING ON COMPLETION ─────────────────────────
        if (status === 'completed' && oldStatus !== 'completed') {
            try {
                const customerLoyalty = await CustomerLoyalty.findOne({
                    where: { customerId: booking.customerId },
                    include: [{ model: LoyaltyTier, as: 'tier' }]
                });

                const baseTier = await LoyaltyTier.findOne({ order: [['id', 'ASC']] });
                const earnRatio = Number(baseTier?.earnRatio || 1);

                const pointsEarned = Math.floor(Number(booking.totalPrice) * earnRatio);

                if (pointsEarned >= 0) {
                    const [loyaltyRecord] = await CustomerLoyalty.findOrCreate({
                        where: { customerId: booking.customerId },
                        defaults: {
                            customerId: booking.customerId,
                            currentPoints: 0,
                            totalPointsEarned: 0,
                            totalPointsRedeemed: 0,
                            totalSpent: 0,
                            tierId: 1
                        }
                    });

                    // Add points
                    loyaltyRecord.currentPoints += pointsEarned;
                    loyaltyRecord.totalPointsEarned += pointsEarned;

                    // Add spent amount
                    loyaltyRecord.totalSpent = Number(loyaltyRecord.totalSpent) + Number(booking.totalPrice);

                    // Tier upgrade logic removed at user request (non-tier-based loyalty)

                    await loyaltyRecord.save();

                    if (pointsEarned > 0) {
                        await PointsTransaction.create({
                            customerId: booking.customerId,
                            points: pointsEarned,
                            type: 'earned',
                            reason: `Earned from booking #${booking.bookingNumber}`
                        });
                        booking.pointsEarned = pointsEarned;
                        await booking.save();
                    }
                    console.log(`Updated loyalty for customer ${booking.customerId}: Added ${pointsEarned} pts and ${booking.totalPrice} spent.`);
                }
            } catch (err) {
                console.error('Error awarding loyalty points on completion:', err);
            }
        }

        res.json({ message: 'Status updated', booking });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Error updating booking status' });
    }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const updateData = req.body;

        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // If date/time/employee changed, check for conflicts (simplified for now)
        // In a real app, you'd re-run the conflict logic from createBooking

        await booking.update(updateData);

        const updatedBooking = await Booking.findByPk(id, {
            include: [
                { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'phone'] },
                { model: Employee, as: 'therapist', attributes: ['firstName', 'lastName'] },
                { model: Service, as: 'service' },
                { model: Room, as: 'room' }
            ]
        });

        res.json(updatedBooking);
    } catch (error) {
        console.error('Update Error:', error);
        res.status(400).json({ message: 'Error updating booking', error });
    }
};

export const resendConfirmation = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const booking = await Booking.findByPk(id, {
            include: [
                { model: User, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'phone'] },
                { model: Employee, as: 'therapist', attributes: ['firstName', 'lastName'] },
                { model: Service, as: 'service' },
                { model: Room, as: 'room' }
            ]
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        await notificationService.sendBookingConfirmation(booking);
        res.json({ message: 'Confirmation email sent' });
    } catch (error) {
        console.error('Resend Error:', error);
        res.status(500).json({ message: 'Failed to resend confirmation' });
    }
};

// --- Reschedule & Cancellation Request Handling ---

export const requestReschedule = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { requestedDate, requestedTime } = req.body;

        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if ((req.user as any).role === 'customer' && booking.customerId !== (req.user as any).id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await booking.update({
            status: 'reschedule_requested',
            rescheduleDate: requestedDate,
            rescheduleTime: requestedTime
        });

        res.json({ message: 'Reschedule request submitted for approval', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting reschedule', error });
    }
};

export const requestCancellation = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { reason } = req.body;

        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if ((req.user as any).role === 'customer' && booking.customerId !== (req.user as any).id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await booking.update({
            status: 'cancellation_requested',
            requestedCancelReason: reason
        });

        res.json({ message: 'Cancellation request submitted for approval', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting cancellation', error });
    }
};

export const handleRescheduleRequest = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { action } = req.body; // 'approve' or 'reject'

        const booking = await Booking.findByPk(id, {
            include: [{ model: Service, as: 'service' }]
        });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (action === 'approve') {
            if (!booking.rescheduleDate || !booking.rescheduleTime) {
                return res.status(400).json({ message: 'Missing requested schedule data' });
            }

            const service = (booking as any).service;
            const newEndTime = addMinutes(booking.rescheduleTime, service.durationMinutes);

            // Re-check conflicts for the new time
            // Therapist conflict
            if (booking.employeeId) {
                const conflict = await Booking.findOne({
                    where: {
                        id: { [Op.ne]: booking.id },
                        employeeId: booking.employeeId,
                        bookingDate: booking.rescheduleDate,
                        status: { [Op.notIn]: ['cancelled', 'completed'] },
                        [Op.or]: [{ startTime: { [Op.lt]: newEndTime }, endTime: { [Op.gt]: booking.rescheduleTime } }]
                    }
                });
                if (conflict) return res.status(409).json({ message: 'Therapist is no longer available at the requested time' });
            }

            // Room conflict
            if (booking.roomId) {
                const conflict = await Booking.findOne({
                    where: {
                        id: { [Op.ne]: booking.id },
                        roomId: booking.roomId,
                        bookingDate: booking.rescheduleDate,
                        status: { [Op.notIn]: ['cancelled', 'completed'] },
                        [Op.or]: [{ startTime: { [Op.lt]: newEndTime }, endTime: { [Op.gt]: booking.rescheduleTime } }]
                    }
                });
                if (conflict) return res.status(409).json({ message: 'Room is no longer available at requested time' });
            }

            await booking.update({
                bookingDate: booking.rescheduleDate,
                startTime: booking.rescheduleTime,
                endTime: newEndTime,
                status: 'confirmed',
                rescheduleDate: undefined,
                rescheduleTime: undefined
            });

            res.json({ message: 'Reschedule approved', booking });
        } else {
            await booking.update({
                status: 'confirmed', // revert to confirmed
                rescheduleDate: undefined,
                rescheduleTime: undefined
            });
            res.json({ message: 'Reschedule rejected', booking });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error handling reschedule request', error });
    }
};

export const handleCancellationRequest = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { action } = req.body; // 'approve' or 'reject'

        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (action === 'approve') {
            await booking.update({ status: 'cancelled' });
            res.json({ message: 'Cancellation approved', booking });
        } else {
            await booking.update({ status: 'confirmed' });
            res.json({ message: 'Cancellation rejected', booking });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error handling cancellation request', error });
    }
};

export const verifyBooking = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const booking = await Booking.findByPk(id, {
            include: [
                { model: User, as: 'customer', attributes: ['firstName', 'lastName'] },
                { model: Service, as: 'service', attributes: ['name'] }
            ]
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        res.json({
            message: 'Booking Verified',
            booking: {
                id: booking.id,
                customer: `${(booking as any).customer?.firstName} ${(booking as any).customer?.lastName}`,
                service: (booking as any).service?.name,
                date: booking.bookingDate,
                time: booking.startTime,
                status: booking.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Verification error', error });
    }
};

/**
 * GET /bookings/availability?serviceId=&date=
 * Returns the service capacity + how many bookings exist per start-time slot
 * for the given service and date. Does NOT expose customer PII.
 */
export const getServiceAvailability = async (req: Request, res: Response) => {
    try {
        const { serviceId, packageId, date } = req.query as { serviceId?: string; packageId?: string; date: string };
        if ((!serviceId && !packageId) || !date) {
            return res.status(400).json({ message: 'serviceId or packageId and date are required' });
        }

        let capacity = 1;
        let targetServiceIds: number[] = [];

        if (serviceId) {
            const service = await Service.findByPk(parseInt(serviceId));
            if (!service) return res.status(404).json({ message: 'Service not found' });
            capacity = Number(service.capacity) || 1;
            targetServiceIds = [parseInt(serviceId)];

            const serviceRooms = await Room.findAll({
                where: { serviceId: parseInt(serviceId) },
                attributes: ['id'],
            });
            const roomIds = serviceRooms.map(r => r.id);
            if (roomIds.length > 0) {
                const blockedRoomCount = await RoomBlock.count({
                    where: { roomId: { [Op.in]: roomIds }, date },
                });
                capacity = Math.max(0, capacity - blockedRoomCount);
            }
        } else if (packageId) {
            const pkg = await Package.findByPk(parseInt(packageId));
            if (!pkg) return res.status(404).json({ message: 'Package not found' });
            targetServiceIds = pkg.serviceIds || [];
            if (targetServiceIds.length > 0) {
                const services = await Service.findAll({ where: { id: { [Op.in]: targetServiceIds } } });
                capacity = Math.min(...services.map(s => Number(s.capacity) || 1));
            }
        }

        const bookings = await Booking.findAll({
            where: {
                bookingDate: date,
                status: { [Op.notIn]: ['cancelled', 'completed'] },
                [Op.or]: [
                    { serviceId: { [Op.in]: targetServiceIds } },
                    { packageId: { [Op.not]: null } }
                ]
            },
            include: [{ model: Package, as: 'package' }],
            attributes: ['startTime', 'endTime', 'serviceId', 'packageId'],
        });

        const slotCounts: Record<string, number> = {};
        for (const b of bookings) {
            let isRelevant = false;
            if (b.serviceId && targetServiceIds.includes(b.serviceId)) {
                isRelevant = true;
            } else if (b.packageId && (b as any).package?.serviceIds) {
                const pkgServiceIds = (b as any).package.serviceIds;
                if (targetServiceIds.some(id => pkgServiceIds.includes(id))) {
                    isRelevant = true;
                }
            }

            if (isRelevant) {
                const [startH, startM] = (b.startTime as string).split(':').map(Number);
                const [endH, endM] = (b.endTime as string).split(':').map(Number);
                const bookingStartMins = startH * 60 + startM;
                const bookingEndMins = endH * 60 + endM;

                // Mark all hourly slots that overlap with this booking
                for (let h = 0; h < 24; h++) {
                    const slotStartMins = h * 60;
                    const slotEndMins = (h + 1) * 60;

                    if (bookingStartMins < slotEndMins && bookingEndMins > slotStartMins) {
                        const slotKey = `${h.toString().padStart(2, '0')}:00`;
                        slotCounts[slotKey] = (slotCounts[slotKey] || 0) + 1;
                    }
                }
            }
        }

        res.json({
            capacity,
            slotCounts,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability', error });
    }
};
