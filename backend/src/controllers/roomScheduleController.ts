import { Request, Response } from 'express';
import RoomBlock from '../models/RoomBlock';
import Booking from '../models/Booking';
import Room from '../models/Room';
import User from '../models/User';
import Service from '../models/Service';
import { Op } from 'sequelize';

/** GET /rooms/:id/schedule?month=YYYY-MM
 *  Returns bookings + blocked dates for the given room in a calendar month.
 */
export const getRoomSchedule = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.id as string);
        const { month } = req.query as { month?: string }; // 'YYYY-MM'

        const now = new Date();
        const [year, mon] = month
            ? month.split('-').map(Number)
            : [now.getFullYear(), now.getMonth() + 1];

        const startDate = `${year}-${String(mon).padStart(2, '0')}-01`;
        const endDay = new Date(year, mon, 0).getDate(); // last day of month
        const endDate = `${year}-${String(mon).padStart(2, '0')}-${endDay}`;

        // Fetch bookings for this room in the month
        const bookings = await Booking.findAll({
            where: {
                roomId,
                bookingDate: { [Op.between]: [startDate, endDate] },
                status: { [Op.notIn]: ['cancelled'] },
            },
            include: [
                { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName'] },
                { model: Service, as: 'service', attributes: ['id', 'name'] },
            ],
            order: [['bookingDate', 'ASC'], ['startTime', 'ASC']],
        });

        // Fetch blocked dates for this room in the month
        const blocks = await RoomBlock.findAll({
            where: {
                roomId,
                date: { [Op.between]: [startDate, endDate] },
            },
            order: [['date', 'ASC']],
        });

        res.json({ bookings, blocks, year, month: mon });
    } catch (error) {
        console.error('getRoomSchedule error:', error);
        res.status(500).json({ message: 'Error fetching room schedule', error });
    }
};

/** POST /rooms/:id/blocks  — block a date */
export const blockRoomDate = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.id as string);
        const { date, reason } = req.body;
        const blockedBy = (req.user as any)?.id ?? null;

        if (!date) return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' });

        const [block, created] = await RoomBlock.findOrCreate({
            where: { roomId, date },
            defaults: { roomId, date, reason: reason || null, blockedBy },
        });

        if (!created) {
            // Update reason if already blocked
            await block.update({ reason: reason || block.reason });
        }

        res.status(created ? 201 : 200).json(block);
    } catch (error) {
        console.error('blockRoomDate error:', error);
        res.status(500).json({ message: 'Error blocking room date', error });
    }
};

/** DELETE /rooms/:id/blocks/:date  — unblock a date */
export const unblockRoomDate = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.id as string);
        const { date } = req.params as { date: string };

        const deleted = await RoomBlock.destroy({ where: { roomId, date } });
        if (!deleted) return res.status(404).json({ message: 'Block not found' });

        res.status(204).send();
    } catch (error) {
        console.error('unblockRoomDate error:', error);
        res.status(500).json({ message: 'Error unblocking room date', error });
    }
};
