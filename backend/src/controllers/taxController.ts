import { Request, Response } from 'express';
import Tax from '../models/Tax';
import { AuthRequest } from '../middleware/authMiddleware';

export const getTaxes = async (req: Request, res: Response) => {
    try {
        const taxes = await Tax.findAll({
            order: [['name', 'ASC']]
        });
        res.json(taxes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching taxes', error });
    }
};

export const createTax = async (req: AuthRequest, res: Response) => {
    try {
        const tax = await Tax.create(req.body);
        res.status(201).json(tax);
    } catch (error) {
        res.status(400).json({ message: 'Error creating tax', error });
    }
};

export const updateTax = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const [updated] = await Tax.update(req.body, {
            where: { id }
        });
        if (!updated) return res.status(404).json({ message: 'Tax not found' });
        const updatedTax = await Tax.findByPk(Number(id));
        res.json(updatedTax);
    } catch (error) {
        res.status(400).json({ message: 'Error updating tax', error });
    }
};

export const deleteTax = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Tax.destroy({
            where: { id }
        });
        if (!deleted) return res.status(404).json({ message: 'Tax not found' });
        res.json({ message: 'Tax deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tax', error });
    }
};

export const getPublicTaxes = async (req: Request, res: Response) => {
    try {
        const taxes = await Tax.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });
        res.json(taxes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active taxes', error });
    }
};
