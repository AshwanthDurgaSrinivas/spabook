import { sequelize } from './config/database';
import LoyaltyTier from './models/LoyaltyTier';

const seed = async () => {
    try {
        await sequelize.authenticate();
        const count = await LoyaltyTier.count();
        if (count === 0) {
            await LoyaltyTier.bulkCreate([
                {
                    name: 'Member',
                    minPoints: 0,
                    pointsMultiplier: 1.0,
                    description: 'Basic membership tier',
                    color: '#6366f1',
                    discountPercentage: 0,
                    isActive: true
                },
                {
                    name: 'Silver',
                    minPoints: 500,
                    pointsMultiplier: 1.2,
                    description: 'Silver tier with 5% discount',
                    color: '#94a3b8',
                    discountPercentage: 5,
                    isActive: true
                },
                {
                    name: 'Gold',
                    minPoints: 1500,
                    pointsMultiplier: 1.5,
                    description: 'Gold tier with 10% discount',
                    color: '#fbbf24',
                    discountPercentage: 10,
                    isActive: true
                },
                {
                    name: 'Platinum',
                    minPoints: 5000,
                    pointsMultiplier: 2.0,
                    description: 'Platinum tier with 20% discount',
                    color: '#2dd4bf',
                    discountPercentage: 20,
                    isActive: true
                }
            ] as any[]);
            console.log('Loyalty tiers seeded successfully');
        } else {
            console.log('Loyalty tiers already exist');
        }
    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        process.exit(0);
    }
};

seed();
