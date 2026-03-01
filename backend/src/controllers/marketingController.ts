import { Request, Response } from 'express';
import Campaign from '../models/Campaign';
import EmailTemplate from '../models/EmailTemplate';
import MarketingAutomation from '../models/MarketingAutomation';

// Campaigns
export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const campaigns = await Campaign.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching campaigns', error });
    }
};

export const createCampaign = async (req: Request, res: Response) => {
    try {
        const campaign = await Campaign.create(req.body);
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ message: 'Error creating campaign', error });
    }
};

export const deleteCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findByPk(id as string);

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        await campaign.destroy();
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting campaign', error });
    }
};

// Templates
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await EmailTemplate.findAll({
            where: { isActive: true }
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.create(req.body);
        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ message: 'Error creating template', error });
    }
};

// Automations
export const getAutomations = async (req: Request, res: Response) => {
    try {
        const automations = await MarketingAutomation.findAll();
        res.json(automations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching automations', error });
    }
};

export const createAutomation = async (req: Request, res: Response) => {
    try {
        const automation = await MarketingAutomation.create(req.body);
        res.status(201).json(automation);
    } catch (error) {
        res.status(400).json({ message: 'Error creating automation', error });
    }
};
