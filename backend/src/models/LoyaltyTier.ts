import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface LoyaltyTierAttributes {
    id: number;
    name: string;
    minSpent: number;
    pointsMultiplier: number;
    description: string;
    color: string;
    benefits: any; // JSONB
    earnRatio: number;
    redeemValue: number;
    minBillForRedemption: number;
    isActive: boolean;
}

interface LoyaltyTierCreationAttributes extends Optional<LoyaltyTierAttributes, 'id'> { }

class LoyaltyTier extends Model<LoyaltyTierAttributes, LoyaltyTierCreationAttributes> implements LoyaltyTierAttributes {
    public id!: number;
    public name!: string;
    public minSpent!: number;
    public pointsMultiplier!: number;
    public description!: string;
    public color!: string;
    public benefits!: any;
    public earnRatio!: number;
    public redeemValue!: number;
    public minBillForRedemption!: number;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

LoyaltyTier.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        minSpent: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        pointsMultiplier: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 1.0,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING,
            defaultValue: '#000000',
        },

        benefits: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        earnRatio: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 1.0,
        },
        redeemValue: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.1,
        },
        minBillForRedemption: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 50.0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'loyalty_tiers',
    }
);
export default LoyaltyTier;
