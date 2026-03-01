
import { Request, Response } from 'express';
import Package from '../models/Package';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all packages (Public & Admin)
export const getPackages = async (req: Request, res: Response) => {
    try {
        const { includeInactive } = req.query;
        const where = includeInactive === 'true' ? {} : { isActive: true };
        const packages = await Package.findAll({
            where,
            order: [['price', 'ASC']]
        });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error });
    }
};

// Get single package
export const getPackageById = async (req: Request, res: Response) => {
    try {
        const pkg = await Package.findByPk(Number(req.params.id));
        if (!pkg) return res.status(404).json({ message: 'Package not found' });
        res.json(pkg);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching package', error });
    }
};

// Create package (Admin/Manager)
export const createPackage = async (req: AuthRequest, res: Response) => {
    try {
        const pkg = await Package.create(req.body);
        res.status(201).json(pkg);
    } catch (error) {
        res.status(400).json({ message: 'Error creating package', error });
    }
};

// Update package (Admin/Manager)
export const updatePackage = async (req: AuthRequest, res: Response) => {
    try {
        const pkg = await Package.findByPk(Number(req.params.id));
        if (!pkg) return res.status(404).json({ message: 'Package not found' });

        await pkg.update(req.body);
        res.json(pkg);
    } catch (error) {
        res.status(400).json({ message: 'Error updating package', error });
    }
};

// Delete package (Admin)
export const deletePackage = async (req: AuthRequest, res: Response) => {
    try {
        const pkg = await Package.findByPk(Number(req.params.id));
        if (!pkg) return res.status(404).json({ message: 'Package not found' });

        await pkg.destroy();
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting package', error });
    }
};
