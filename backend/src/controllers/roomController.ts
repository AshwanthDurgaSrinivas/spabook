import { Request, Response } from 'express';
import Room from '../models/Room';
import Service from '../models/Service';
import ServiceCategory from '../models/ServiceCategory';
import { provisionRoomsForService } from '../services/roomProvisioner';

export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await Room.findAll({
            include: [{ model: ServiceCategory, as: 'serviceCategory', attributes: ['id', 'name'] }],
            order: [['serviceCategoryId', 'ASC'], ['roomNumber', 'ASC'], ['name', 'ASC']]
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error });
    }
};

export const getRoomById = async (req: Request, res: Response) => {
    try {
        const room = await Room.findByPk(parseInt(req.params.id as string), {
            include: [{ model: ServiceCategory, as: 'serviceCategory', attributes: ['id', 'name'] }]
        });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room', error });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({ message: 'Error creating room', error });
    }
};

export const updateRoom = async (req: Request, res: Response) => {
    try {
        const [updated] = await Room.update(req.body, {
            where: { id: parseInt(req.params.id as string) },
        });
        if (!updated) return res.status(404).json({ message: 'Room not found' });
        const updatedRoom = await Room.findByPk(parseInt(req.params.id as string));
        res.json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: 'Error updating room', error });
    }
};

export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const deleted = await Room.destroy({
            where: { id: parseInt(req.params.id as string) },
        });
        if (!deleted) return res.status(404).json({ message: 'Room not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting room', error });
    }
};

/**
 * POST /rooms/provision-all
 * Admin-only:
 * 1. Remove manually-added rooms that have no serviceId/serviceCategoryId and no active bookings.
 * 2. Iterate EVERY service individually and call provisionRoomsForService for each.
 *    5 services × capacity each = correct total rooms, zero cross-contamination.
 */
export const provisionAllRooms = async (req: Request, res: Response) => {
    try {
        // ── Step 1: Remove stale manually-created rooms (no serviceId) ──
        const Booking = (await import('../models/Booking')).default;
        const { Op } = await import('sequelize');

        const unlinkedRooms = await Room.findAll({
            where: { serviceId: null }
        });

        let removedCount = 0;
        for (const room of unlinkedRooms) {
            const activeBooking = await Booking.findOne({
                where: {
                    roomId: room.id,
                    status: { [Op.notIn]: ['cancelled', 'completed'] }
                }
            });
            if (!activeBooking) {
                await room.destroy();
                removedCount++;
            }
        }

        // ── Step 2: Provision rooms per SERVICE ──
        const services = await Service.findAll();

        const results: { service: string; capacity: number; roomsCreated: number }[] = [];

        for (const svc of services) {
            const cap = Number(svc.capacity) || 1;
            const before = await Room.count({ where: { serviceId: svc.id } });
            await provisionRoomsForService(svc.id, svc.name, svc.categoryId ?? null, cap);
            const after = await Room.count({ where: { serviceId: svc.id } });

            results.push({
                service: svc.name,
                capacity: cap,
                roomsCreated: Math.max(0, after - before),
            });
        }

        res.json({
            message: 'Room provisioning complete',
            removedManualRooms: removedCount,
            summary: results,
        });
    } catch (error) {
        console.error('Provision all rooms error:', error);
        res.status(500).json({ message: 'Error provisioning rooms', error });
    }
};
