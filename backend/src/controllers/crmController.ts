import { Request, Response } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import Campaign from '../models/Campaign';
import MembershipPlan from '../models/MembershipPlan';
import CustomerMembership from '../models/CustomerMembership';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { notificationService } from '../services/notificationService';

export const getCRMAnalytics = async (req: Request, res: Response) => {
    try {
        const customersCount = await User.count({ where: { role: 'customer' } });
        const customers = await User.findAll({
            where: { role: 'customer' },
            include: [{
                model: CustomerMembership,
                required: false,
                where: { status: 'active' },
                include: [{ model: MembershipPlan, as: 'plan' }]
            }],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM bookings AS b
                            WHERE b."customerId" = "User".id
                            AND b.status IN ('confirmed', 'completed', 'in_progress')
                        )`),
                        'totalVisits'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(b."totalAmount"), 0)
                            FROM bookings AS b
                            WHERE b."customerId" = "User".id
                            AND b.status IN ('confirmed', 'completed', 'in_progress')
                        )`),
                        'totalSpent'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT MAX("bookingDate")
                            FROM bookings AS b
                            WHERE b."customerId" = "User".id
                            AND b.status IN ('confirmed', 'completed')
                        )`),
                        'lastVisitDate'
                    ]
                ]
            }
        });

        const plans = await MembershipPlan.findAll({ where: { isActive: true } });
        const today = new Date();

        // 1. Membership-based Segments
        const segmentCounts: Record<string, { label: string, count: number }> = {};
        plans.forEach(plan => {
            segmentCounts[plan.id] = { label: plan.name, count: 0 };
        });
        segmentCounts['none'] = { label: 'Non-Members', count: 0 };

        // RFM Bins
        const rfmBins = {
            champions: 0, loyal: 0, potential: 0, new: 0, atRisk: 0, lost: 0
        };

        let totalLTV = 0;
        const formattedCustomers = customers.map(c => {
            const data = c.toJSON() as any;
            const spent = parseFloat(data.totalSpent || 0);
            const visits = parseInt(data.totalVisits || 0);
            const lastVisit = data.lastVisitDate ? new Date(data.lastVisitDate) : null;
            const daysSinceLastVisit = lastVisit ? Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 3600 * 24)) : 365;

            totalLTV += spent;

            // Membership Segment
            const activeMembership = data.CustomerMemberships?.[0];
            if (activeMembership && activeMembership.plan) {
                segmentCounts[activeMembership.plan.id].count++;
            } else {
                segmentCounts['none'].count++;
            }

            // RFM Analysis
            if (spent > 500 && visits > 5 && daysSinceLastVisit < 30) rfmBins.champions++;
            else if (visits >= 3 && daysSinceLastVisit < 60) rfmBins.loyal++;
            else if (visits === 1 && daysSinceLastVisit < 14) rfmBins.new++;
            else if (daysSinceLastVisit > 120) rfmBins.lost++;
            else if (daysSinceLastVisit > 60) rfmBins.atRisk++;
            else rfmBins.potential++;

            return { id: c.id, spent, visits, daysSinceLastVisit };
        });

        // 2. Conversion Funnel (Dynamic)
        const totalUsers = customersCount;
        const withBookings = formattedCustomers.filter(c => c.visits > 0).length;
        const recurring = formattedCustomers.filter(c => c.visits > 1).length;
        const members = customers.filter(c => (c as any).CustomerMemberships?.length > 0).length;

        const funnel = [
            { stage: 'Awareness', count: totalUsers * 5, percentage: 100 },
            { stage: 'Interest', count: totalUsers * 2, percentage: 40 },
            { stage: 'Engagement', count: totalUsers, percentage: 20 },
            { stage: 'Booking', count: withBookings, percentage: totalUsers > 0 ? Math.round((withBookings / totalUsers) * 100) : 0 },
            { stage: 'Retention', count: recurring, percentage: totalUsers > 0 ? Math.round((recurring / totalUsers) * 100) : 0 }
        ];

        // 3. Recent Activities
        const recentActivities = await Booking.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'customer', attributes: ['firstName', 'lastName'] }]
        });

        const formattedActivities = recentActivities.map(b => ({
            id: b.id,
            type: 'booking',
            description: `New booking for ${b.bookingNumber || 'Service'}`,
            user: (b as any).customer ? `${(b as any).customer.firstName} ${(b as any).customer.lastName}` : 'Guest',
            timestamp: b.createdAt
        }));

        // 4. Campaign Analytics
        const campaignHistory = await Campaign.findAll({ limit: 5, order: [['createdAt', 'DESC']] });

        const emailAgg = await Campaign.findOne({
            where: { campaignType: 'email' },
            attributes: [
                [sequelize.fn('sum', sequelize.col('totalSent')), 'totalSent'],
                [sequelize.fn('sum', sequelize.col('totalOpened')), 'totalOpened'],
                [sequelize.fn('sum', sequelize.col('totalClicked')), 'totalClicked']
            ],
            raw: true
        }) as any;

        const smsAgg = await Campaign.findOne({
            where: { campaignType: 'sms' },
            attributes: [
                [sequelize.fn('sum', sequelize.col('totalSent')), 'totalSent'],
                [sequelize.fn('sum', sequelize.col('totalDelivered')), 'totalDelivered']
            ],
            raw: true
        }) as any;

        res.json({
            metrics: {
                totalCustomers: totalUsers,
                activeCustomers: formattedCustomers.filter(c => c.daysSinceLastVisit < 60).length,
                avgLTV: totalUsers > 0 ? totalLTV / totalUsers : 0,
                retentionRate: totalUsers > 0 ? Math.round((recurring / totalUsers) * 100) : 0
            },
            segments: Object.entries(segmentCounts).map(([key, s]) => ({
                value: key,
                label: s.label,
                count: s.count
            })),
            rfm: [
                { name: 'Champions', count: rfmBins.champions },
                { name: 'Loyal', count: rfmBins.loyal },
                { name: 'Potential', count: rfmBins.potential },
                { name: 'New', count: rfmBins.new },
                { name: 'At Risk', count: rfmBins.atRisk },
                { name: 'Lost', count: rfmBins.lost }
            ],
            funnel,
            recentActivities: formattedActivities,
            campaigns: {
                email: {
                    sent: parseInt(emailAgg?.totalSent || 0),
                    opened: parseInt(emailAgg?.totalOpened || 0),
                    clicked: parseInt(emailAgg?.totalClicked || 0)
                },
                sms: {
                    sent: parseInt(smsAgg?.totalSent || 0),
                    delivered: parseInt(smsAgg?.totalDelivered || 0)
                },
                list: campaignHistory
            }
        });
    } catch (error) {
        console.error('CRM Analytics Error:', error);
        res.status(500).json({ message: 'Error fetching CRM analytics', error });
    }
};

export const executeCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findByPk(id as string);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        if (campaign.status === 'sent') return res.status(400).json({ message: 'Campaign already sent' });

        const customers = await User.findAll({ where: { role: 'customer' } });

        if (campaign.campaignType === 'email') {
            let successCount = 0;
            for (const customer of customers) {
                const trackingPixel = `<img src="http://localhost:5000/api/crm/track/open/${campaign.id}?user=${customer.id}" width="1" height="1" style="display:none;" />`;
                const trackedLink = `http://localhost:5000/api/crm/track/click/${campaign.id}?user=${customer.id}&url=http://localhost:5174`;

                const sent = await notificationService.sendEmail(
                    customer.email,
                    campaign.name,
                    `<div style="font-family: sans-serif; padding: 20px;">
                        <h2>${campaign.name}</h2>
                        <p>Hi ${customer.firstName},</p>
                        <p>${campaign.description || 'We have something special for you!'}</p>
                        <div style="margin: 20px 0;">
                            <a href="${trackedLink}" style="background-color: #F08080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Our Site</a>
                        </div>
                        <hr/>
                        <p style="font-size: 12px; color: #666;">Sparkle Beauty Lounge</p>
                        ${trackingPixel}
                    </div>`
                );
                if (sent) successCount++;
            }
            await campaign.update({
                status: 'sent',
                sentAt: new Date(),
                totalSent: successCount,
                totalRecipients: customers.length
            });
        } else {
            // SMS logic would go here
            await campaign.update({ status: 'sent', sentAt: new Date(), totalSent: customers.length });
        }

        res.json({ message: 'Campaign sent successfully', count: customers.length });
    } catch (error) {
        console.error('Campaign execution error:', error);
        res.status(500).json({ message: 'Error sending campaign' });
    }
};

export const getCustomersBySegment = async (req: Request, res: Response) => {
    try {
        const { segmentValue } = req.params;
        const where: any = { role: 'customer' };
        const include: any[] = [];

        if (segmentValue === 'all') {
            // No additional filter needed for 'all', keep just role: 'customer'
        } else if (segmentValue !== 'none') {
            include.push({
                model: CustomerMembership,
                required: true,
                where: { status: 'active', planId: segmentValue },
                include: [{ model: MembershipPlan, as: 'plan' }]
            });
        } else {
            where.id = {
                [Op.notIn]: sequelize.literal(`(
                    SELECT "customerId" 
                    FROM customer_memberships 
                    WHERE status = 'active'
                )`)
            };
        }

        const customers = await User.findAll({
            where,
            include,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        });

        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers by segment:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
};

export const sendSegmentCampaign = async (req: Request, res: Response) => {
    try {
        const { segmentValue } = req.params;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        const where: any = { role: 'customer' };
        const include: any[] = [];

        if (segmentValue === 'all') {
            // Keep role: 'customer'
        } else if (segmentValue !== 'none') {
            include.push({
                model: CustomerMembership,
                required: true,
                where: { status: 'active', planId: segmentValue }
            });
        } else {
            where.id = {
                [Op.notIn]: sequelize.literal(`(
                    SELECT "customerId" 
                    FROM customer_memberships 
                    WHERE status = 'active'
                )`)
            };
        }

        const customers = await User.findAll({ where, include });

        // Create campaign first so we have an ID for tracking
        const campaign = await Campaign.create({
            name: subject,
            campaignType: 'email',
            description: message,
            status: 'draft',
            totalRecipients: customers.length,
            segmentCriteria: { segmentValue }
        });

        let successCount = 0;
        for (const customer of customers) {
            const trackingPixel = `<img src="http://localhost:5000/api/crm/track/open/${campaign.id}?user=${customer.id}" width="1" height="1" style="display:none;" />`;
            const trackedLink = `http://localhost:5000/api/crm/track/click/${campaign.id}?user=${customer.id}&url=http://localhost:5174`;

            // Basic link replacement (if the message contained pure links, we'd replace them, but for now we append a generic action button)
            const sent = await notificationService.sendEmail(
                customer.email,
                subject,
                `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #F08080;">${subject}</h2>
                    <p>Hi ${customer.firstName},</p>
                    <div style="line-height: 1.6; color: #444;">${message.replace(/\n/g, '<br/>')}</div>
                    
                    <div style="margin: 25px 0;">
                        <a href="${trackedLink}" style="background-color: #F08080; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Explore Now</a>
                    </div>
                    
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #999;">Sent by Sparkle Beauty Lounge CRM System</p>
                    ${trackingPixel}
                </div>`
            );
            if (sent) successCount++;
        }

        await campaign.update({
            status: 'sent',
            sentAt: new Date(),
            totalSent: successCount
        });

        res.json({ message: 'Targeted campaign sent successfully', count: successCount });
    } catch (error) {
        console.error('Segment campaign error:', error);
        res.status(500).json({ message: 'Error sending targeted campaign' });
    }
};

export const trackEmailOpen = async (req: Request, res: Response) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findByPk(campaignId as string);

        if (campaign) {
            await campaign.increment('totalOpened', { by: 1 });
        }

        // Return 1x1 transparent GIF
        const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': img.length
        });
        res.end(img);
    } catch (error) {
        res.status(500).send();
    }
};

export const trackEmailClick = async (req: Request, res: Response) => {
    try {
        const { campaignId } = req.params;
        const redirectUrl = req.query.url as string || 'http://localhost:5174';

        const campaign = await Campaign.findByPk(campaignId as string);
        if (campaign) {
            await campaign.increment('totalClicked', { by: 1 });
        }

        res.redirect(redirectUrl);
    } catch (error) {
        res.redirect('http://localhost:5174');
    }
};
