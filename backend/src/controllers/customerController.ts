import { Request, Response } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import Employee from '../models/Employee';
import { AuthRequest } from '../middleware/authMiddleware';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';

// Admin view only
export const getCustomers = async (req: AuthRequest, res: Response) => {
    try {
        const { role, id, email } = req.user as any;
        const today = new Date().toISOString().split('T')[0];

        let employeeId = id;
        if (['employee', 'therapist'].includes(role)) {
            const emp = await Employee.findOne({
                where: {
                    [Op.or]: [
                        { id: id },
                        { email: email || '' }
                    ]
                }
            });
            if (emp) employeeId = emp.id;
        }

        let customerWhere: any = { role: 'customer' };

        // Staff restriction: only see customers booked for today with them
        if (['employee', 'therapist'].includes(role)) {
            customerWhere.id = {
                [Op.in]: sequelize.literal(`(
                    SELECT "customerId"
                    FROM bookings
                    WHERE "employeeId" = ${employeeId}
                    AND "bookingDate" = '${today}'
                    AND status NOT IN ('cancelled')
                )`)
            };
        }

        const customers = await User.findAll({
            where: customerWhere,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM bookings AS b
                            WHERE b."customerId" = "User".id
                            AND b.status IN ('confirmed', 'completed', 'in_progress')
                        )`),
                        'totalVisits'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(b."totalAmount"), 0)
                            FROM bookings AS b
                            WHERE b."customerId" = "User".id
                            AND b.status IN ('confirmed', 'completed', 'in_progress')
                        )`),
                        'totalSpent'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM customer_memberships AS cm
                            WHERE cm."customerId" = "User".id
                            AND cm.status = 'active'
                            AND cm."endDate" >= CURRENT_DATE
                        )`),
                        'hasActiveMembership'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT mp.name
                            FROM customer_memberships AS cm
                            JOIN membership_plans AS mp ON cm."planId" = mp.id
                            WHERE cm."customerId" = "User".id
                            AND cm.status = 'active'
                            AND cm."endDate" >= CURRENT_DATE
                            LIMIT 1
                        )`),
                        'membershipPlan'
                    ]
                ]
            }
        });

        const formattedCustomers = customers.map(c => {
            const data = c.toJSON() as any;
            data.totalSpent = parseFloat(data.totalSpent || 0);
            data.totalVisits = parseInt(data.totalVisits || 0);
            data.hasActiveMembership = parseInt(data.hasActiveMembership || 0) > 0;
            data.membershipPlan = data.membershipPlan || null;
            data.lifetimeValue = data.totalSpent;
            data.averageOrderValue = data.totalVisits > 0 ? parseFloat((data.totalSpent / data.totalVisits).toFixed(2)) : 0;
            data.customerCode = `CUST-${c.id.toString().padStart(4, '0')}`;
            return data;
        });

        res.json(formattedCustomers);
    } catch (error) {
        console.error('Fetch Customers Error:', error);
        res.status(500).json({ message: 'Error fetching customers', error });
    }
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { role, id: userId, email } = req.user as any;
        const today = new Date().toISOString().split('T')[0];

        if (['employee', 'therapist'].includes(role)) {
            const emp = await Employee.findOne({
                where: {
                    [Op.or]: [
                        { id: userId },
                        { email: email || '' }
                    ]
                }
            });
            const employeeId = emp ? emp.id : userId;

            const hasBooking = await Booking.findOne({
                where: {
                    customerId: id,
                    employeeId: employeeId,
                    bookingDate: today,
                    status: { [Op.ne]: 'cancelled' }
                }
            });
            if (!hasBooking) {
                return res.status(403).json({ message: 'Access denied: You can only view customers booked with you today.' });
            }
        }

        const customer = await User.findByPk(id, {
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM bookings AS b
                            WHERE b."customerId" = "User".id
                            AND b.status IN ('confirmed', 'completed', 'in_progress')
                        )`),
                        'totalVisits'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(b."totalAmount"), 0)
                            FROM bookings AS b
                            WHERE b."customerId" = "User".id
                            AND b.status IN ('confirmed', 'completed', 'in_progress')
                        )`),
                        'totalSpent'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM customer_memberships AS cm
                            WHERE cm."customerId" = "User".id
                            AND cm.status = 'active'
                            AND cm."endDate" >= CURRENT_DATE
                        )`),
                        'hasActiveMembership'
                    ]
                ]
            }
        });

        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        // Add additional calculated fields if needed for the UI
        const customerData = customer.toJSON() as any;
        customerData.totalSpent = parseFloat(customerData.totalSpent || 0);
        customerData.totalVisits = parseInt(customerData.totalVisits || 0);
        customerData.hasActiveMembership = parseInt(customerData.hasActiveMembership || 0) > 0;
        customerData.lifetimeValue = customerData.totalSpent;
        customerData.averageOrderValue = customerData.totalVisits > 0 ? parseFloat((customerData.totalSpent / customerData.totalVisits).toFixed(2)) : 0;
        customerData.customerCode = `CUST-${id.toString().padStart(4, '0')}`;

        res.json(customerData);
    } catch (error) {
        console.error('Fetch Customer By ID Error:', error);
        res.status(500).json({ message: 'Error fetching customer', error });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    // Basic user creation but restricted to role customer? Use Auth Register instead?
    // Admin might want to add a customer manually without password initially?
    try {
        const user = await User.create({ ...req.body, role: 'customer' });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error creating customer', error });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const [updated] = await User.update(req.body, { where: { id: parseInt(req.params.id as string) } });
        if (!updated) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer' });
    }
};
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const deleted = await User.destroy({ where: { id: parseInt(req.params.id as string), role: 'customer' } });
        if (!deleted) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};
