import { Request, Response } from 'express';
import Contact from '../models/Contact';
import { AuthRequest } from '../middleware/authMiddleware';


// Create a contact request (Public)
export const createContact = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, phone, subject, message } = req.body;
        const contact = await Contact.create({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message
        });

        res.status(201).json(contact);
    } catch (error) {
        console.error('Error creating contact request:', error);
        res.status(400).json({ message: 'Error creating contact request', error });
    }
};

// Get all contact requests (Admin/Manager)
export const getContacts = async (req: AuthRequest, res: Response) => {
    try {
        const contacts = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact requests', error });
    }
};

// Get single contact request (Admin/Manager)
export const getContactById = async (req: AuthRequest, res: Response) => {
    try {
        const contact = await Contact.findByPk(Number(req.params.id));
        if (!contact) return res.status(404).json({ message: 'Contact request not found' });

        // Mark as read if it was unread
        if (contact.status === 'unread') {
            contact.status = 'read';
            await contact.save();
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact request', error });
    }
};

// Update contact status (Admin/Manager)
export const updateContactStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const contact = await Contact.findByPk(Number(req.params.id));
        if (!contact) return res.status(404).json({ message: 'Contact request not found' });

        contact.status = status;
        await contact.save();

        res.json(contact);
    } catch (error) {
        res.status(400).json({ message: 'Error updating contact status', error });
    }
};

// Delete contact request (Admin)
export const deleteContact = async (req: AuthRequest, res: Response) => {
    try {
        const contact = await Contact.findByPk(Number(req.params.id));
        if (!contact) return res.status(404).json({ message: 'Contact request not found' });

        await contact.destroy();
        res.json({ message: 'Contact request deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact request', error });
    }
};
