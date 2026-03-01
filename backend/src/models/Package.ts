
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PackageAttributes {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    duration: string;
    features: string[];
    serviceIds: number[];
    isPopular: boolean;
    isActive: boolean;
    image?: string;
}

interface PackageCreationAttributes extends Optional<PackageAttributes, 'id' | 'isPopular' | 'isActive' | 'serviceIds'> { }

class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public price!: number;
    public originalPrice?: number;
    public duration!: string;
    public features!: string[];
    public serviceIds!: number[];
    public isPopular!: boolean;
    public isActive!: boolean;
    public image?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Package.init(
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
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        originalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        features: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        serviceIds: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            defaultValue: [],
        },
        isPopular: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'packages',
    }
);

export default Package;
