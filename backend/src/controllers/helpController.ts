
import { Request, Response } from 'express';
import FAQ from '../models/FAQ';
import SupportTicket from '../models/SupportTicket';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// FAQs
export const getFAQs = async (req: Request, res: Response) => {
    try {
        const faqs = await FAQ.findAll({
            where: { isActive: true },
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching FAQs', error });
    }
};

export const adminGetFAQs = async (req: Request, res: Response) => {
    try {
        const faqs = await FAQ.findAll({
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching FAQs', error });
    }
};

export const createFAQ = async (req: Request, res: Response) => {
    try {
        const faq = await FAQ.create(req.body);
        res.status(201).json(faq);
    } catch (error) {
        res.status(400).json({ message: 'Error creating FAQ', error });
    }
};

export const updateFAQ = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const faq = await FAQ.findByPk(id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });

        await faq.update(req.body);
        res.json(faq);
    } catch (error) {
        res.status(400).json({ message: 'Error updating FAQ', error });
    }
};

export const deleteFAQ = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const faq = await FAQ.findByPk(id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });

        await faq.destroy();
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting FAQ', error });
    }
};

// Tickets
export const createTicket = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const ticket = await SupportTicket.create({
            ...req.body,
            userId
        });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error creating ticket', error });
    }
};

export const getCustomerTickets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const tickets = await SupportTicket.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets', error });
    }
};

export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await SupportTicket.findAll({
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets', error });
    }
};

export const updateTicket = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const ticket = await SupportTicket.findByPk(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        await ticket.update(req.body);
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error updating ticket', error });
    }
};
