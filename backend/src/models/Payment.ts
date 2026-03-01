import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Booking from './Booking';

interface PaymentAttributes {
    id: number;
    bookingId: number;
    amount: number;
    method: 'cash' | 'card' | 'online';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId: string;
    paymentDate: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id'> { }

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    public id!: number;
    public bookingId!: number;
    public amount!: number;
    public method!: 'cash' | 'card' | 'online';
    public status!: 'pending' | 'completed' | 'failed' | 'refunded';
    public transactionId!: string;
    public paymentDate!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        bookingId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'bookings',
                key: 'id',
            },
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        method: {
            type: DataTypes.ENUM('cash', 'card', 'online', 'wallet'),
            defaultValue: 'cash',
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
            defaultValue: 'pending',
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'payments',
        indexes: [
            { fields: ['bookingId'] },
            { fields: ['transactionId'] },
            { fields: ['method'] }
        ]
    }
);

Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Booking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments' });

export default Payment;
