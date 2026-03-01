
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface FAQAttributes {
    id: number;
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
}

interface FAQCreationAttributes extends Optional<FAQAttributes, 'id' | 'category' | 'order' | 'isActive'> { }

class FAQ extends Model<FAQAttributes, FAQCreationAttributes> implements FAQAttributes {
    public id!: number;
    public question!: string;
    public answer!: string;
    public category!: string;
    public order!: number;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

FAQ.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: 'General',
        },
        order: {
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
        tableName: 'faqs',
    }
);

export default FAQ;
