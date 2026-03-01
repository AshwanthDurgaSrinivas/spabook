
const { Setting } = require('./backend/src/models');
const { sequelize } = require('./backend/src/config/database');

async function checkSettings() {
    try {
        await sequelize.authenticate();
        const settings = await Setting.findAll();
        console.log('--- ALL SETTINGS ---');
        settings.forEach(s => {
            console.log(`${s.key}: ${s.value}`);
        });
        console.log('-------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSettings();
