
import { sequelize } from './src/config/database';
import Employee from './src/models/Employee';
import User from './src/models/User';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    try {
        console.log('Connecting...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Syncing...');
        // Raw query to sync because new columns might not exist if server hasn't restarted yet
        // OR rely on server having run. Let's assume server ran once.
        // But better to be safe.
        await sequelize.sync({ alter: true });
        console.log('Synced.');

        const employees = await Employee.findAll();
        console.log(`Found ${employees.length} employees.`);

        for (const emp of employees) {
            console.log(`Processing emp ${emp.id}...`);
            if (emp.userId) {
                const user = await User.findByPk(emp.userId);
                if (user) {
                    console.log(`Updating emp ${emp.id} with ${user.firstName} ${user.lastName}`);
                    await emp.update({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone
                    });
                } else {
                    console.log(`User not found for emp ${emp.id}`);
                }
            } else {
                console.log(`No userId for emp ${emp.id}`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
    console.log('Done.');
    process.exit();
};

migrate();
