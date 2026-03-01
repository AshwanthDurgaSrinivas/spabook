
const { MembershipPlan } = require('./backend/src/models');
const { sequelize } = require('./backend/src/config/database');

async function checkPlans() {
    try {
        await sequelize.authenticate();
        const plans = await MembershipPlan.findAll();
        console.log('--- ALL PLANS ---');
        plans.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, Type: ${typeof p.price}`);
        });
        console.log('-------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPlans();
