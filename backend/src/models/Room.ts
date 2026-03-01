import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import ServiceCategory from './ServiceCategory';

interface RoomAttributes {
    id: number;
    name: string;
    type: string;
    capacity: number;
    status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
    isVip: boolean;
    hourlyRate: number;
    serviceCategoryId: number | null; // for grouping/display
    serviceId: number | null;         // THE service that owns this room slot
    roomNumber: number | null;        // ordinal slot (1, 2, 3, … up to service.capacity)
}

interface RoomCreationAttributes extends Optional<RoomAttributes, 'id' | 'serviceCategoryId' | 'serviceId' | 'roomNumber'> { }

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
    public id!: number;
    public name!: string;
    public type!: string;
    public capacity!: number;
    public status!: 'available' | 'occupied' | 'maintenance' | 'cleaning';
    public isVip!: boolean;
    public hourlyRate!: number;
    public serviceCategoryId!: number | null;
    public serviceId!: number | null;
    public roomNumber!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Room.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            defaultValue: 'Standard',
        },
        capacity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'cleaning'),
            defaultValue: 'available',
        },
        isVip: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        hourlyRate: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        serviceCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: ServiceCategory, key: 'id' },
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'The specific service this room slot belongs to',
        },
        roomNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Slot number within the service pool (1 … service.capacity)',
        },
    },
    {
        sequelize,
        tableName: 'rooms',
    }
);

Room.belongsTo(ServiceCategory, { foreignKey: 'serviceCategoryId', as: 'serviceCategory' });
ServiceCategory.hasMany(Room, { foreignKey: 'serviceCategoryId', as: 'rooms' });

export default Room;
