import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ServiceCategoryAttributes {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
}

interface ServiceCategoryCreationAttributes extends Optional<ServiceCategoryAttributes, 'id' | 'description' | 'image' | 'icon' | 'displayOrder' | 'isActive'> { }

class ServiceCategory extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes> implements ServiceCategoryAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public description!: string;
    public image!: string;
    public icon!: string;
    public displayOrder!: number;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ServiceCategory.init(
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
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'service_categories',
    }
);
export default ServiceCategory;
