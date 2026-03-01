import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Employee from './Employee';
import Service from './Service';

interface BookingAttributes {
    id: number;
    customerId: number;
    employeeId: number | null;
    serviceId: number | null;
    packageId: number | null;
    roomId: number; // optional in logic, but good for tracking
    bookingDate: Date;
    startTime: string;
    endTime: string;
    totalPrice: number;
    totalAmount: number;
    bookingNumber: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'reschedule_requested' | 'cancellation_requested';
    paymentStatus: 'pending' | 'paid' | 'partial' | 'failed';
    taxes?: any;
    rescheduleDate?: Date;
    rescheduleTime?: string;
    requestedCancelReason?: string;
    pointsEarned?: number;
    pointsRedeemed?: number;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'status' | 'paymentStatus' | 'totalAmount' | 'serviceId' | 'packageId'> { }

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
    public id!: number;
    public customerId!: number;
    public employeeId!: number | null;
    public serviceId!: number | null;
    public packageId!: number | null;
    public roomId!: number;
    public bookingDate!: Date;
    public startTime!: string;
    public endTime!: string;
    public totalPrice!: number;
    public totalAmount!: number;
    public bookingNumber!: string;
    public status!: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'reschedule_requested' | 'cancellation_requested';
    public paymentStatus!: 'pending' | 'paid' | 'partial' | 'failed';
    public taxes?: any;
    public rescheduleDate?: Date;
    public rescheduleTime?: string;
    public requestedCancelReason?: string;
    public pointsEarned?: number;
    public pointsRedeemed?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Booking.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        customerId: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'id',
            },
            allowNull: false,
        },
        employeeId: {
            type: DataTypes.INTEGER,
            references: {
                model: Employee,
                key: 'id',
            },
            allowNull: true,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            references: {
                model: Service,
                key: 'id',
            },
            allowNull: true,
        },
        packageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'packages',
                key: 'id',
            },
            allowNull: true,
        },
        roomId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'rooms',
                key: 'id',
            },
            allowNull: true,
        },
        bookingDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        bookingNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'reschedule_requested', 'cancellation_requested'),
            defaultValue: 'pending',
        },
        paymentStatus: {
            type: DataTypes.ENUM('pending', 'paid', 'partial', 'failed'),
            defaultValue: 'pending',
        },
        taxes: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        rescheduleDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        rescheduleTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        requestedCancelReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        pointsEarned: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        pointsRedeemed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    },
    {
        sequelize,
        tableName: 'bookings',
        indexes: [
            { fields: ['bookingDate'] },
            { fields: ['customerId'] },
            { fields: ['employeeId'] },
            { fields: ['status'] }
        ]
    }
);

import Room from './Room';
import Package from './Package';
Booking.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Booking.belongsTo(Employee, { as: 'therapist', foreignKey: 'employeeId' });
Booking.belongsTo(Service, { as: 'service', foreignKey: 'serviceId' });
Booking.belongsTo(Package, { as: 'package', foreignKey: 'packageId' });
Booking.belongsTo(Room, { as: 'room', foreignKey: 'roomId' });

export default Booking;
