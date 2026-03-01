import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const DB_NAME = process.env.DB_NAME || 'spabook_erp';
const DB_USER = process.env.DB_USER || 'spa';
const DB_PASS = process.env.DB_PASS || 'spa';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

// First create a temporary connection to postgres to check/create the target database
const sequelizeSetup = new Sequelize(`postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/postgres`, {
    logging: false,
});

export const initializeDatabase = async () => {
    try {
        await sequelizeSetup.authenticate();
        console.log('Connected to Postgres server.');

        // Check if database exists
        const [results] = await sequelizeSetup.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
        if (results.length === 0) {
            console.log(`Database ${DB_NAME} not found. Creating...`);
            await sequelizeSetup.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`Database ${DB_NAME} created.`);
        } else {
            console.log(`Database ${DB_NAME} already exists.`);
        }
    } catch (error) {
        console.error('Unable to connect to the database or create it:', error);
    } finally {
        await sequelizeSetup.close();
    }
};

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: parseInt(DB_PORT),
    dialect: 'postgres',
    logging: false,
});
