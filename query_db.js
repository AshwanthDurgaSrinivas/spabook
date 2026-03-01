
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function checkDb() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();

        const plans = await client.query('SELECT id, name, price, "isActive" FROM membership_plans');
        console.log('--- MEMBERSHIP PLANS ---');
        plans.rows.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, Active: ${p.isActive}`);
        });

        const activeMems = await client.query('SELECT "customerId", "planId", status FROM customer_memberships WHERE status = \'active\'');
        console.log('--- ACTIVE MEMBERSHIPS ---');
        activeMems.rows.forEach(m => {
            console.log(`Customer: ${m.customerId}, Plan: ${m.planId}, Status: ${m.status}`);
        });

        await client.end();
    } catch (err) {
        console.error('Database connection error:', err.stack);
    }
}

checkDb();
