import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface EmailTemplateAttributes {
    id: number;
    name: string;
    slug: string;
    subject: string;
    bodyHtml: string;
    variables: string[];
    isActive: boolean;
}

interface EmailTemplateCreationAttributes extends Optional<EmailTemplateAttributes, 'id'> { }

class EmailTemplate extends Model<EmailTemplateAttributes, EmailTemplateCreationAttributes> implements EmailTemplateAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public subject!: string;
    public bodyHtml!: string;
    public variables!: string[];
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

EmailTemplate.init(
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
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bodyHtml: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        variables: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'email_templates',
    }
);

export default EmailTemplate;
