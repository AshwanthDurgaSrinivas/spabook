import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface EmployeeAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department: string;
    designation: string;
    skills: object;
    commissionRate: number;
    hourlyRate: number;
    profileImage?: string;
    passwordHash: string;
    role: 'admin' | 'manager' | 'receptionist' | 'therapist' | 'employee' | 'super_admin';
    status: 'active' | 'inactive';
    requiredHours: number;
    lastLoginAt?: Date;
    geofenceBypass: boolean;
    geofenceId?: number | null;
}

interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id' | 'phone' | 'profileImage' | 'department' | 'designation' | 'skills' | 'hourlyRate' | 'commissionRate' | 'role' | 'status' | 'requiredHours' | 'lastLoginAt' | 'geofenceBypass' | 'geofenceId'> { }

class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public phone!: string;
    public department!: string;
    public designation!: string;
    public skills!: object;
    public commissionRate!: number;
    public hourlyRate!: number;
    public profileImage?: string;
    public passwordHash!: string;
    public role!: 'admin' | 'manager' | 'receptionist' | 'therapist' | 'employee' | 'super_admin';
    public status!: 'active' | 'inactive';
    public requiredHours!: number;
    public lastLoginAt?: Date;
    public geofenceBypass!: boolean;
    public geofenceId!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Employee.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Unknown'
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Staff'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        skills: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        commissionRate: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        hourlyRate: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'),
            defaultValue: 'employee',
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
        requiredHours: {
            type: DataTypes.INTEGER,
            defaultValue: 9, // Default 9 hours
        },
        geofenceBypass: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        geofenceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'employees'
    }
);

export default Employee;

