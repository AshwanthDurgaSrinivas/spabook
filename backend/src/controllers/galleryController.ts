import { Request, Response } from 'express';
import GalleryItem from '../models/GalleryItem';

export const getGalleryItems = async (req: Request, res: Response) => {
    try {
        const { category, activeOnly } = req.query;
        const where: any = {};

        if (category && category !== 'All') {
            where.category = category;
        }

        if (activeOnly === 'true') {
            where.isActive = true;
        }

        const items = await GalleryItem.findAll({
            where,
            order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery items', error });
    }
};

export const createGalleryItem = async (req: Request, res: Response) => {
    try {
        const item = await GalleryItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: 'Error creating gallery item', error });
    }
};

export const updateGalleryItem = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const [updated] = await GalleryItem.update(req.body, {
            where: { id }
        });
        if (!updated) return res.status(404).json({ message: 'Gallery item not found' });
        const updatedItem = await GalleryItem.findByPk(id);
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error updating gallery item', error });
    }
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const deleted = await GalleryItem.destroy({
            where: { id }
        });
        if (!deleted) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting gallery item', error });
    }
};
