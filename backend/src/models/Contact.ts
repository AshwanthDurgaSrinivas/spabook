
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ContactAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
}

interface ContactCreationAttributes extends Optional<ContactAttributes, 'id' | 'status'> { }

class Contact extends Model<ContactAttributes, ContactCreationAttributes> implements ContactAttributes {
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public phone?: string;
    public subject!: string;
    public message!: string;
    public status!: 'unread' | 'read' | 'replied';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Contact.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
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
            type: DataTypes.ENUM('unread', 'read', 'replied'),
            defaultValue: 'unread',
        },
    },
    {
        sequelize,
        tableName: 'contacts',
    }
);

export default Contact;
