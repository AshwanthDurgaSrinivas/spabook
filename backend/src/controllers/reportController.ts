import { Request, Response } from 'express';
import Report from '../models/Report';
import { AuthRequest } from '../middleware/authMiddleware';

export const getReports = async (req: AuthRequest, res: Response) => {
    try {
        const reports = await Report.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error });
    }
};

export const createReport = async (req: AuthRequest, res: Response) => {
    try {
        const { name, type, parameters, format, scheduleFrequency } = req.body;

        const nextRunAt = scheduleFrequency !== 'none' ? new Date() : null; // Simple logic for now

        const report = await Report.create({
            name,
            type,
            parameters: JSON.stringify(parameters),
            format,
            scheduleFrequency,
            status: 'completed', // For now we assume its completed immediately as its mostly client side
            createdBy: req.user?.id,
            lastRunAt: new Date(),
            nextRunAt
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error creating report', error });
    }
};

export const deleteReport = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Report.destroy({ where: { id } });
        res.json({ message: 'Report deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting report' });
    }
};
