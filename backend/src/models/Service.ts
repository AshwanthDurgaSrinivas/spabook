import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import ServiceCategory from './ServiceCategory';

interface ServiceAttributes {
    id: number;
    categoryId: number;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    durationMinutes: number;
    basePrice: number;
    taxRate: number;
    imageUrls: string[];
    isActive: boolean;
    isBundle: boolean;
    capacity: number; // max simultaneous bookings (1 = exclusive, >1 = group/class)
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'description' | 'shortDescription' | 'durationMinutes' | 'basePrice' | 'taxRate' | 'imageUrls' | 'isActive' | 'isBundle' | 'capacity'> { }

class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
    public id!: number;
    public categoryId!: number;
    public name!: string;
    public slug!: string;
    public description!: string;
    public shortDescription!: string;
    public durationMinutes!: number;
    public basePrice!: number;
    public taxRate!: number;
    public imageUrls!: string[];
    public isActive!: boolean;
    public isBundle!: boolean;
    public capacity!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Service.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: ServiceCategory,
                key: 'id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        shortDescription: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        durationMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        basePrice: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        taxRate: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        imageUrls: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        isBundle: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        capacity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
            comment: 'Max simultaneous bookings allowed (1=exclusive, >1=group/class)'
        },
    },
    {
        sequelize,
        tableName: 'services',
    }
);

Service.belongsTo(ServiceCategory, { foreignKey: 'categoryId' });
ServiceCategory.hasMany(Service, { foreignKey: 'categoryId' });

export default Service;
