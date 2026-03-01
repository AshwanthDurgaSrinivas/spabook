
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface SupportTicketAttributes {
    id: number;
    userId: number;
    subject: string;
    message: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    adminNote?: string;
}

interface SupportTicketCreationAttributes extends Optional<SupportTicketAttributes, 'id' | 'status' | 'priority' | 'adminNote'> { }

class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> implements SupportTicketAttributes {
    public id!: number;
    public userId!: number;
    public subject!: string;
    public message!: string;
    public status!: 'open' | 'in-progress' | 'resolved' | 'closed';
    public priority!: 'low' | 'medium' | 'high' | 'urgent';
    public adminNote?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SupportTicket.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('open', 'in-progress', 'resolved', 'closed'),
            defaultValue: 'open',
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            defaultValue: 'medium',
        },
        adminNote: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'support_tickets',
    }
);

SupportTicket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default SupportTicket;
