import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'admin' | 'manager' | 'customer' | 'employee' | 'super_admin';
    status: 'active' | 'inactive';
    lastLoginAt?: Date;
    googleId?: string;
    facebookId?: string;
    segment?: 'vip' | 'regular' | 'new' | 'dormant' | 'at-risk';
    marketingEmails?: boolean;
    smsNotifications?: boolean;
    language?: string;
    darkMode?: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public passwordHash!: string;
    public firstName!: string;
    public lastName!: string;
    public phone?: string;
    public role!: 'admin' | 'manager' | 'customer' | 'employee' | 'super_admin';
    public status!: 'active' | 'inactive';
    public lastLoginAt?: Date;
    public googleId?: string;
    public facebookId?: string;
    // segment?: 'vip' | 'regular' | 'new' | 'dormant' | 'at-risk';
    public marketingEmails?: boolean;
    public smsNotifications?: boolean;
    public language?: string;
    public darkMode?: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('admin', 'manager', 'customer', 'employee', 'super_admin'),
            defaultValue: 'customer',
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
            allowNull: false,
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        googleId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        facebookId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        /*
        segment: {
            type: DataTypes.STRING,
            defaultValue: 'regular',
        },
        */
        marketingEmails: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        smsNotifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        language: {
            type: DataTypes.STRING,
            defaultValue: 'English (US)',
        },
        darkMode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        sequelize,
        tableName: 'users',
    }
);

export default User;
