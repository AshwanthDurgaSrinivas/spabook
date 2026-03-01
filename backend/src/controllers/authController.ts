import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Employee from '../models/Employee';
import CustomerMembership from '../models/CustomerMembership';
import MembershipPlan from '../models/MembershipPlan';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey12345';

export const register = async (req: Request, res: Response) => {
    try {
        console.log('Register Request Body:', req.body); // DEBUG LOG
        const { email, password, firstName, lastName, phone, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            role: role || 'customer',
            status: 'active'
        });
        console.log('New User Created:', newUser.toJSON()); // DEBUG LOG

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        let user: any = await User.findOne({ where: { email } });
        let userType = 'User';

        if (!user) {
            user = await Employee.findOne({ where: { email } });
            if (user) {
                userType = 'Employee';
            }
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, userType },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        let membership = null;
        if (userType !== 'Employee') {
            membership = await CustomerMembership.findOne({
                where: { customerId: user.id, status: 'active' },
                include: [{ model: MembershipPlan, as: 'plan' }]
            });
        }

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                userType,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                membership: membership
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        // @ts-ignore - user is attached by auth middleware
        const tokenUser = req.user;
        const userId = tokenUser?.id;
        const userType = tokenUser?.userType;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let user: any = null;
        if (userType === 'Employee') {
            user = await Employee.findByPk(userId);
        } else {
            user = await User.findByPk(userId);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let membership = null;
        if (userType !== 'Employee') {
            membership = await CustomerMembership.findOne({
                where: { customerId: userId, status: 'active' },
                include: [{ model: MembershipPlan, as: 'plan' }]
            });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                userType: userType || 'User',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                membership: membership,
                marketingEmails: user.marketingEmails,
                smsNotifications: user.smsNotifications,
                language: user.language,
                darkMode: user.darkMode
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = (req.user as any)?.id;
        const userType = (req.user as any)?.userType;

        let user: any;
        if (userType === 'Employee') {
            user = await Employee.findByPk(userId);
        } else {
            user = await User.findByPk(userId);
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const userType = (req.user as any)?.userType;

        if (userType === 'Employee') {
            await Employee.update(req.body, { where: { id: userId } });
        } else {
            await User.update(req.body, { where: { id: userId } });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
