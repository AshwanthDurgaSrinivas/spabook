import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ProductAttributes {
    id: number;
    name: string;
    description: string;
    sku: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    isActive: boolean;
    image?: string;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> { }

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public sku!: string;
    public category!: string;
    public price!: number;
    public cost!: number;
    public stock!: number;
    public minStock!: number;
    public isActive!: boolean;
    public image?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Product.init(
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
            allowNull: true,
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        minStock: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
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
        tableName: 'products',
    }
);
export default Product;
