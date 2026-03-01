import { Request, Response } from 'express';
import Service from '../models/Service';
import ServiceCategory from '../models/ServiceCategory';
import { provisionRoomsForService } from '../services/roomProvisioner';

// --- Categories ---
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await ServiceCategory.findAll({ order: [['displayOrder', 'ASC']] });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Generate slug if not provided
        let slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Ensure slug is unique
        let existing = await ServiceCategory.findOne({ where: { slug } });
        let counter = 1;
        const originalSlug = slug;
        while (existing) {
            slug = `${originalSlug}-${counter}`;
            existing = await ServiceCategory.findOne({ where: { slug } });
            counter++;
        }

        const category = await ServiceCategory.create({
            ...req.body,
            slug
        });
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(400).json({ message: 'Error creating category', error });
    }
};

// --- Services ---
export const getServices = async (req: Request, res: Response) => {
    try {
        const services = await Service.findAll({
            include: [{ model: ServiceCategory }],
            order: [['name', 'ASC']],
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error });
    }
};

export const getServiceById = async (req: Request, res: Response) => {
    try {
        const service = await Service.findByPk(parseInt(req.params.id as string), {
            include: [{ model: ServiceCategory }],
        });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service', error });
    }
};

export const createService = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Service name is required' });
        }

        let slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Ensure slug is unique
        let existing = await Service.findOne({ where: { slug } });
        let counter = 1;
        const originalSlug = slug;
        while (existing) {
            slug = `${originalSlug}-${counter}`;
            existing = await Service.findOne({ where: { slug } });
            counter++;
        }

        const service = await Service.create({
            ...req.body,
            slug
        });

        // Auto-provision rooms keyed to THIS specific service
        const cap = Number(req.body.capacity) || 1;
        await provisionRoomsForService(
            service.id,
            service.name,
            service.categoryId ?? null,
            cap
        ).catch(err => console.error('Room provisioning failed:', err));

        res.status(201).json(service);
    } catch (error: any) {
        console.error('Error creating service:', error);
        res.status(400).json({ message: 'Error creating service', error: error.message });
    }
};

export const updateService = async (req: Request, res: Response) => {
    try {
        const [updated] = await Service.update(req.body, {
            where: { id: parseInt(req.params.id as string) },
        });
        if (!updated) return res.status(404).json({ message: 'Service not found' });
        const updatedService = await Service.findByPk(parseInt(req.params.id as string));

        // Re-provision rooms for THIS specific service (fixes cross-contamination bug)
        if (updatedService) {
            const cap = Number(updatedService.capacity) || 1;
            await provisionRoomsForService(
                updatedService.id,
                updatedService.name,
                updatedService.categoryId ?? null,
                cap
            ).catch(err => console.error('Room provisioning failed:', err));
        }

        res.json(updatedService);
    } catch (error) {
        res.status(400).json({ message: 'Error updating service', error });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    try {
        const deleted = await Service.destroy({
            where: { id: parseInt(req.params.id as string) },
        });
        if (!deleted) return res.status(404).json({ message: 'Service not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error });
    }
};
