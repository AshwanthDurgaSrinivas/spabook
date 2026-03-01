import { sequelize } from './config/database';

const run = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.getQueryInterface().dropTable('customer_loyalties');
        console.log('Dropped customer_loyalties');
    } catch (e) {
        console.log('Error dropping customer_loyalties (maybe not exist)', e);
    }
};

run().then(() => process.exit());
