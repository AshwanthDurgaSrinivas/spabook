import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Employee from '../models/Employee';
import Leave from '../models/Leave';
import { AuthRequest } from '../middleware/authMiddleware';
import GeofenceLocation from '../models/GeofenceLocation';
import { Op } from 'sequelize';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

const isWithinGeofence = async (lat: number, lon: number, specificGeofenceId?: number | null): Promise<boolean> => {
    // If a specific geofence is assigned to the employee, check ONLY that one
    if (specificGeofenceId) {
        const loc = await GeofenceLocation.findByPk(specificGeofenceId);
        if (!loc || !loc.isActive) return true; // Fail safe: if assigned loc is missing/inactive, allow
        const distance = calculateDistance(lat, lon, Number(loc.latitude), Number(loc.longitude));
        return distance <= loc.radius;
    }

    // Default: check against ALL active geofences
    const locations = await GeofenceLocation.findAll({ where: { isActive: true } });
    if (locations.length === 0) return true; // No geofence set, allow all

    for (const loc of locations) {
        const distance = calculateDistance(lat, lon, Number(loc.latitude), Number(loc.longitude));
        if (distance <= loc.radius) return true;
    }
    return false;
};

export const checkIn = async (req: AuthRequest, res: Response) => {
    try {
        const { id, email } = req.user;
        const { latitude, longitude } = req.body;

        let employee = await Employee.findByPk(id);
        if (!employee) {
            employee = await Employee.findOne({ where: { email } });
        }

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found. Staff record required for check-in.' });
        }

        console.log(`[Attendance] Check-In Request: User=${email}, Lat=${latitude}, Lon=${longitude}`);

        // Geofence check
        if (!employee.geofenceBypass) {
            if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
                return res.status(400).json({ message: 'Location access is required for check-in. Please enable GPS.' });
            }

            try {
                const allowed = await isWithinGeofence(latitude, longitude, employee.geofenceId);
                if (!allowed) {
                    return res.status(403).json({ message: 'You are not within your authorized work location geofence.' });
                }
            } catch (geoErr) {
                console.error('[Attendance] Geofence calculation error:', geoErr);
                // If geofence calculation fails, we might want to allow check-in but log it, 
                // or deny. For now, let's be safe and log it then continue if it's a code error.
            }
        }

        const today = new Date().toISOString().split('T')[0];
        const existing = await Attendance.findOne({
            where: { employeeId: employee.id, date: today }
        });

        if (existing) {
            return res.status(400).json({ message: 'Already checked in for today', attendance: existing });
        }

        const attendance = await Attendance.create({
            employeeId: employee.id,
            date: today,
            checkInTime: new Date(),
            status: 'present',
            notes: `Checked in from ${latitude}, ${longitude}`
        });

        res.status(201).json(attendance);
    } catch (error) {
        console.error('[Attendance] Check-in error:', error);
        res.status(500).json({
            message: 'Internal server error during check-in',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const checkOut = async (req: AuthRequest, res: Response) => {
    try {
        const { id, email } = req.user;
        const { latitude, longitude } = req.body;

        let employee = await Employee.findByPk(id);
        if (!employee) {
            employee = await Employee.findOne({ where: { email } });
        }

        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        console.log(`[Attendance] Check-Out Request: User=${email}, Lat=${latitude}, Lon=${longitude}`);

        // Geofence check
        if (!employee.geofenceBypass) {
            if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
                return res.status(400).json({ message: 'Location access is required for check-out' });
            }
            const allowed = await isWithinGeofence(latitude, longitude, employee.geofenceId);
            if (!allowed) {
                return res.status(403).json({ message: 'You are not within an authorized work location' });
            }
        }

        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({
            where: { employeeId: employee.id, date: today }
        });

        if (!attendance) return res.status(404).json({ message: 'No attendance record found for today' });
        if (attendance.checkOutTime) return res.status(400).json({ message: 'Already checked out', attendance });

        // If user is currently on break, end the break automatically
        if (attendance.lastBreakStart) {
            const breakEnd = new Date();
            const diffMs = breakEnd.getTime() - new Date(attendance.lastBreakStart).getTime();
            const diffMins = Math.round(diffMs / 60000);
            attendance.breakMinutes += diffMins;
            attendance.lastBreakStart = null;
        }

        const checkOutTime = new Date();
        attendance.checkOutTime = checkOutTime;

        // Calculate working hours
        const checkInTime = new Date(attendance.checkInTime).getTime();
        const breakMins = attendance.breakMinutes || 0;
        const durationMins = (checkOutTime.getTime() - checkInTime) / 60000 - breakMins;
        const durationHours = durationMins / 60;
        const reqHours = employee.requiredHours || 9;

        if (durationHours < reqHours) {
            attendance.status = 'absent';
            const shortNote = `Incomplete shift: worked ${durationHours.toFixed(2)}h, required ${reqHours}h.`;
            attendance.notes = attendance.notes ? `${attendance.notes}. ${shortNote}` : shortNote;
        } else {
            attendance.status = 'present';
        }

        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error checking out' });
    }
};

export const toggleBreak = async (req: AuthRequest, res: Response) => {
    try {
        const { id, email } = req.user;

        let employee = await Employee.findByPk(id);
        if (!employee) {
            employee = await Employee.findOne({ where: { email } });
        }
        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({
            where: { employeeId: employee.id, date: today }
        });

        if (!attendance) return res.status(404).json({ message: 'Must check in before taking a break' });
        if (attendance.checkOutTime) return res.status(400).json({ message: 'Shift already ended' });

        const now = new Date();
        if (attendance.lastBreakStart) {
            // Ending break
            const diffMs = now.getTime() - new Date(attendance.lastBreakStart).getTime();
            const diffMins = Math.round(diffMs / 60000);
            attendance.breakMinutes += diffMins;
            attendance.lastBreakStart = null;
        } else {
            // Starting break
            attendance.lastBreakStart = now;
        }

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling break', error });
    }
};

export const getTodayStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id, email } = req.user;
        let employee = await Employee.findByPk(id);
        if (!employee) {
            employee = await Employee.findOne({ where: { email } });
        }
        if (!employee) return res.json(null);

        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({
            where: { employeeId: employee.id, date: today }
        });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching today status' });
    }
};

export const getAttendance = async (req: Request, res: Response) => {
    try {
        const { employeeId, date } = req.query;
        let where: any = {};
        if (employeeId) where.employeeId = employeeId;
        if (date) where.date = date;

        const attendances = await Attendance.findAll({
            where,
            include: [{ model: Employee }],
            order: [['date', 'DESC']]
        });
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { id, email } = req.user;

        let employee = await Employee.findByPk(id);
        if (!employee) {
            employee = await Employee.findOne({ where: { email } });
        }

        if (!employee) {
            return res.json({ records: [], stats: { present: 0, absent: 0, leaves: 0 } });
        }

        const attendances = await Attendance.findAll({
            where: { employeeId: employee.id },
            include: [{ model: Employee }],
            order: [['date', 'DESC']]
        });

        const presentDays = attendances.filter(a => a.status === 'present' || a.status === 'late').length;

        const leaveCount = await Leave.count({
            where: { employeeId: employee.id, status: 'approved' }
        });

        res.json({
            records: attendances,
            stats: {
                present: presentDays,
                absent: 0,
                leaves: leaveCount,
                requiredHours: employee.requiredHours || 9
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your attendance' });
    }
};

export const updateAttendanceStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status, notes } = req.body;

        const attendance = await Attendance.findByPk(id);
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

        if (status) {
            if (!['present', 'absent', 'leave', 'half_day', 'late'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            attendance.status = status;
        }
        if (notes !== undefined) attendance.notes = notes;

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error updating attendance status' });
    }
};
