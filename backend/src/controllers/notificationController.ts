import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Notification from '../models/Notification';
import { Op } from 'sequelize';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const notifications = await Notification.findAll({
            where: {
                [Op.or]: [
                    { userId: userId },
                    { userId: null }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

export const createNotification = async (req: AuthRequest, res: Response) => {
    try {
        const { title, message, type, userId } = req.body;

        const notification = await Notification.create({
            title,
            message,
            type: type || 'system',
            userId: userId || null, // null for global
            isRead: false
        });

        const io = (req.app as any).get('io');
        if (io) {
            if (userId && userId !== 'all') {
                io.to(`user_${userId}`).emit('new_notification', notification);
            } else {
                io.emit('new_notification', notification);
            }
        }

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const notification = await Notification.findByPk(parseInt(id as string));
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        // Check ownership if it's a personal notification
        if (notification.userId && notification.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await notification.update({ isRead: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error });
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        await Notification.update(
            { isRead: true },
            {
                where: {
                    [Op.or]: [
                        { userId: userId },
                        { userId: null }
                    ],
                    isRead: false
                }
            }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error });
    }
};
