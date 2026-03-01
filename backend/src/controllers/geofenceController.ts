import { Request, Response } from 'express';
import GeofenceLocation from '../models/GeofenceLocation';
import Employee from '../models/Employee';
import { AuthRequest } from '../middleware/authMiddleware';

export const getLocations = async (req: AuthRequest, res: Response) => {
    try {
        const locations = await GeofenceLocation.findAll();
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching geofence locations', error });
    }
};

export const createLocation = async (req: AuthRequest, res: Response) => {
    try {
        const location = await GeofenceLocation.create(req.body);
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error creating geofence location', error });
    }
};

export const updateLocation = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const location = await GeofenceLocation.findByPk(id);
        if (!location) return res.status(404).json({ message: 'Location not found' });

        await location.update(req.body);
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error updating geofence location', error });
    }
};

export const deleteLocation = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const location = await GeofenceLocation.findByPk(id);
        if (!location) return res.status(404).json({ message: 'Location not found' });

        await location.destroy();
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting geofence location', error });
    }
};

export const getExceptions = async (req: AuthRequest, res: Response) => {
    try {
        const employees = await Employee.findAll({
            where: { geofenceBypass: true },
            attributes: ['id', 'firstName', 'lastName', 'email', 'geofenceBypass']
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching geofence exceptions', error });
    }
};

export const updateException = async (req: AuthRequest, res: Response) => {
    try {
        const employeeId = req.params.employeeId as string;
        const { geofenceBypass } = req.body;

        const employee = await Employee.findByPk(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await employee.update({ geofenceBypass });
        res.json({ message: 'Exception status updated', employee });
    } catch (error) {
        res.status(500).json({ message: 'Error updating exception', error });
    }
};
