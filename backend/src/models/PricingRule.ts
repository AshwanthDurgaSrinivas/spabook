import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Service from './Service';

interface PricingRuleAttributes {
    id: number;
    serviceId: number | null; // null means applies to all services
    ruleName: string;
    daysOfWeek: number[]; // [0-6] 0 is Sunday
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    adjustmentType: 'fixed' | 'percentage';
    adjustmentValue: number;
    priority: number;
    isActive: boolean;
}

interface PricingRuleCreationAttributes extends Optional<PricingRuleAttributes, 'id' | 'serviceId' | 'isActive' | 'priority'> { }

class PricingRule extends Model<PricingRuleAttributes, PricingRuleCreationAttributes> implements PricingRuleAttributes {
    public id!: number;
    public serviceId!: number | null;
    public ruleName!: string;
    public daysOfWeek!: number[];
    public startTime!: string;
    public endTime!: string;
    public adjustmentType!: 'fixed' | 'percentage';
    public adjustmentValue!: number;
    public priority!: number;
    public isActive!: boolean;
}

PricingRule.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            references: {
                model: Service,
                key: 'id',
            },
            allowNull: true,
        },
        ruleName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        daysOfWeek: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            defaultValue: [0, 1, 2, 3, 4, 5, 6],
        },
        startTime: {
            type: DataTypes.STRING,
            defaultValue: '00:00',
        },
        endTime: {
            type: DataTypes.STRING,
            defaultValue: '23:59',
        },
        adjustmentType: {
            type: DataTypes.ENUM('fixed', 'percentage'),
            allowNull: false,
        },
        adjustmentValue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'pricing_rules',
    }
);

PricingRule.belongsTo(Service, { foreignKey: 'serviceId' });

export default PricingRule;
