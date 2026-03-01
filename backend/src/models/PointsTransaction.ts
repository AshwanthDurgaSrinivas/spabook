import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface PointsTransactionAttributes {
    id: number;
    customerId: number;
    points: number;
    type: 'earned' | 'redeemed' | 'adjusted';
    reason: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PointsTransactionCreationAttributes extends Optional<PointsTransactionAttributes, 'id'> { }

class PointsTransaction extends Model<PointsTransactionAttributes, PointsTransactionCreationAttributes> implements PointsTransactionAttributes {
    public id!: number;
    public customerId!: number;
    public points!: number;
    public type!: 'earned' | 'redeemed' | 'adjusted';
    public reason!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PointsTransaction.init(
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
            allowNull: false,
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('earned', 'redeemed', 'adjusted'),
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'points_transactions',
    }
);

PointsTransaction.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
User.hasMany(PointsTransaction, { as: 'pointsTransactions', foreignKey: 'customerId' });

export default PointsTransaction;
