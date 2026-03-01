import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AutomationAttributes {
    id: number;
    name: string;
    trigger: string;
    description?: string;
    isActive: boolean;
    totalSends: number;
    totalOpens: number;
    totalClicks: number;
    configuration: object;
}

interface AutomationCreationAttributes extends Optional<AutomationAttributes, 'id' | 'totalSends' | 'totalOpens' | 'totalClicks' | 'isActive'> { }

class MarketingAutomation extends Model<AutomationAttributes, AutomationCreationAttributes> implements AutomationAttributes {
    public id!: number;
    public name!: string;
    public trigger!: string;
    public description?: string;
    public isActive!: boolean;
    public totalSends!: number;
    public totalOpens!: number;
    public totalClicks!: number;
    public configuration!: object;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MarketingAutomation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        trigger: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        totalSends: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalOpens: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalClicks: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        configuration: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
    },
    {
        sequelize,
        tableName: 'marketing_automations',
    }
);

export default MarketingAutomation;
