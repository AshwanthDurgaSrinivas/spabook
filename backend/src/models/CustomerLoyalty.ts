import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import LoyaltyTier from './LoyaltyTier';

interface CustomerLoyaltyAttributes {
    id: number;
    customerId: number;
    tierId?: number | null;
    currentPoints: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalSpent: number;
}

interface CustomerLoyaltyCreationAttributes extends Optional<CustomerLoyaltyAttributes, 'id'> { }

class CustomerLoyalty extends Model<CustomerLoyaltyAttributes, CustomerLoyaltyCreationAttributes> implements CustomerLoyaltyAttributes {
    public id!: number;
    public customerId!: number;
    public tierId?: number | null;
    public currentPoints!: number;
    public totalPointsEarned!: number;
    public totalPointsRedeemed!: number;
    public totalSpent!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CustomerLoyalty.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customerId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
            unique: true,
            allowNull: false,
        },
        tierId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'loyalty_tiers',
                key: 'id',
            },
            // defaultValue: 1, // Removed to avoid sync error
        },
        currentPoints: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalPointsEarned: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalPointsRedeemed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalSpent: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'customer_loyalties',
    }
);

CustomerLoyalty.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
User.hasOne(CustomerLoyalty, { foreignKey: 'customerId' });
CustomerLoyalty.belongsTo(LoyaltyTier, { as: 'tier', foreignKey: 'tierId' });

export default CustomerLoyalty;
