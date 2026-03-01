
import { sequelize } from './src/config/database';

async function checkEnum() {
    try {
        const [results] = await sequelize.query("SELECT n.nspname as schema, t.typname as type, e.enumlabel as value FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'enum_users_role';");
        console.log('Enum values for enum_users_role:', results);

        // Also check the attendances table
        const [cols] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attendances';");
        console.log('Attendances columns:', cols);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEnum();
