import { sequelize } from './config/database';
import User from './models/User';
import LoyaltyTier from './models/LoyaltyTier';
import CustomerLoyalty from './models/CustomerLoyalty';
import Booking from './models/Booking';
import Payment from './models/Payment';
import Service from './models/Service';

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('Auth success');
        await sequelize.sync({ alter: true });
        console.log('Sync success');
    } catch (e) {
        console.error('Sync error:', e);
    }
};

run();
