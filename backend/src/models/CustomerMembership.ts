import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import MembershipPlan from './MembershipPlan';

interface CustomerMembershipAttributes {
    id: number;
    customerId: number;
    planId: number;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'cancelled';
    autoRenew: boolean;
}

interface CustomerMembershipCreationAttributes extends Optional<CustomerMembershipAttributes, 'id'> { }

class CustomerMembership extends Model<CustomerMembershipAttributes, CustomerMembershipCreationAttributes> implements CustomerMembershipAttributes {
    public id!: number;
    public customerId!: number;
    public planId!: number;
    public startDate!: Date;
    public endDate!: Date;
    public status!: 'active' | 'expired' | 'cancelled';
    public autoRenew!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CustomerMembership.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customerId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users', // Use string to avoid circular dependency issues
                key: 'id',
            },
            allowNull: false,
        },
        planId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'membership_plans',
                key: 'id',
            },
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'expired', 'cancelled'),
            defaultValue: 'active',
        },
        autoRenew: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'customer_memberships',
    }
);

CustomerMembership.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
User.hasMany(CustomerMembership, { foreignKey: 'customerId' });
CustomerMembership.belongsTo(MembershipPlan, { as: 'plan', foreignKey: 'planId' });

export default CustomerMembership;
