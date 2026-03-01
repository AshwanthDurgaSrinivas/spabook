import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class Notification extends Model {
    public id!: number;
    public title!: string;
    public message!: string;
    public type!: 'system' | 'booking' | 'payment' | 'reminder';
    public isRead!: boolean;
    public userId!: number | null; // null means global notification
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Notification.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('system', 'booking', 'payment', 'reminder'),
        defaultValue: 'system'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true // Global if null
    }
}, {
    sequelize,
    modelName: 'Notification'
});

export default Notification;
