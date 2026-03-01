
const { sequelize } = require('./backend/src/config/database');
const { DataTypes } = require('sequelize');

async function checkPlans() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query('SELECT id, name, price, "isActive" FROM membership_plans');
        console.log('--- MEMBERSHIP PLANS ---');
        results.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, Active: ${p.isActive}`);
        });
        console.log('-------------------------');
        const [mem] = await sequelize.query('SELECT "customerId", "planId", status FROM customer_memberships WHERE status = \'active\'');
        console.log('--- ACTIVE MEMBERSHIPS ---');
        mem.forEach(m => {
            console.log(`Customer: ${m.customerId}, Plan: ${m.planId}, Status: ${m.status}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPlans();
