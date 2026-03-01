import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface GalleryItemAttributes {
    id: number;
    title: string;
    imageUrl: string;
    category: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
}

interface GalleryItemCreationAttributes extends Optional<GalleryItemAttributes, 'id' | 'description' | 'isActive' | 'displayOrder'> { }

class GalleryItem extends Model<GalleryItemAttributes, GalleryItemCreationAttributes> implements GalleryItemAttributes {
    public id!: number;
    public title!: string;
    public imageUrl!: string;
    public category!: string;
    public description?: string;
    public isActive!: boolean;
    public displayOrder!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

GalleryItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'gallery_items',
    }
);

export default GalleryItem;
