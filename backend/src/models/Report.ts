import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class Report extends Model {
    public id!: number;
    public name!: string;
    public type!: string;
    public parameters!: string;
    public format!: string;
    public status!: 'pending' | 'completed' | 'failed';
    public filePath!: string;
    public createdBy!: number;
    public lastRunAt!: Date;
    public scheduleFrequency!: 'daily' | 'weekly' | 'monthly' | 'none';
    public nextRunAt!: Date;
}

Report.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parameters: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    format: {
        type: DataTypes.STRING,
        defaultValue: 'pdf',
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'completed',
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    lastRunAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    scheduleFrequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'none'),
        defaultValue: 'none',
    },
    nextRunAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Report',
});

export default Report;
