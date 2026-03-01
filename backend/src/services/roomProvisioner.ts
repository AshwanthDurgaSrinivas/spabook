/**
 * roomProvisioner.ts
 *
 * Ensures that for every SERVICE there are exactly `service.capacity` rooms,
 * named "{ServiceName} Room 1" … "{ServiceName} Room N".
 *
 * Rooms are keyed by serviceId (not categoryId) so that changing one service's
 * capacity never affects another service's rooms — even if they share a category.
 *
 * - When capacity grows  → new rooms are appended
 * - When capacity shrinks → excess rooms without active bookings are removed
 */

import Room from '../models/Room';
import Service from '../models/Service';
import Booking from '../models/Booking';
import { Op } from 'sequelize';

/**
 * Provision exactly `capacity` rooms for a specific service.
 * Rooms are named "{serviceName} Room 1" … "{serviceName} Room capacity".
 */
export async function provisionRoomsForService(
    serviceId: number,
    serviceName: string,
    categoryId: number | null,
    capacity: number
): Promise<void> {
    // Fetch existing rooms for THIS specific service
    const existingRooms = await Room.findAll({
        where: { serviceId },
        order: [['roomNumber', 'ASC']],
    });

    const currentCount = existingRooms.length;

    if (capacity > currentCount) {
        // Create missing rooms
        for (let n = currentCount + 1; n <= capacity; n++) {
            await Room.create({
                name: `${serviceName} Room ${n}`,
                type: serviceName,
                capacity: 1,
                status: 'available',
                isVip: false,
                hourlyRate: 0,
                serviceId,
                serviceCategoryId: categoryId,
                roomNumber: n,
            });
        }
    } else if (capacity < currentCount) {
        // Remove excess rooms (highest numbers first), skip those with active bookings
        const roomsToRemove = existingRooms
            .filter(r => (r.roomNumber ?? 0) > capacity)
            .sort((a, b) => (b.roomNumber ?? 0) - (a.roomNumber ?? 0));

        for (const room of roomsToRemove) {
            const activeBooking = await Booking.findOne({
                where: {
                    roomId: room.id,
                    status: { [Op.notIn]: ['cancelled', 'completed'] },
                },
            });
            if (!activeBooking) {
                await room.destroy();
            }
        }
    }
    // capacity === currentCount → nothing to do
}

/**
 * Convenience wrapper: look up a service by ID then provision its rooms.
 * Kept for backward compatibility — used by serviceController on create/update.
 */
export async function provisionRoomsForCategory(
    categoryId: number,
    capacity: number
): Promise<void> {
    // This old signature is no longer meaningful for per-service provisioning.
    // Kept as a no-op so existing call-sites don't break; the real work is done
    // by provisionRoomsForService called from serviceController directly.
}
