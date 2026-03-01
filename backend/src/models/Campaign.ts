import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CampaignAttributes {
    id: number;
    name: string;
    campaignType: 'email' | 'sms' | 'push' | 'whatsapp';
    description?: string;
    segmentCriteria: object;
    scheduledAt?: Date;
    sentAt?: Date;
    totalRecipients: number;
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
}

interface CampaignCreationAttributes extends Optional<CampaignAttributes, 'id' | 'totalRecipients' | 'totalSent' | 'totalDelivered' | 'totalOpened' | 'totalClicked'> { }

class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> implements CampaignAttributes {
    public id!: number;
    public name!: string;
    public campaignType!: 'email' | 'sms' | 'push' | 'whatsapp';
    public description?: string;
    public segmentCriteria!: object;
    public scheduledAt?: Date;
    public sentAt?: Date;
    public totalRecipients!: number;
    public totalSent!: number;
    public totalDelivered!: number;
    public totalOpened!: number;
    public totalClicked!: number;
    public status!: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Campaign.init(
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
        campaignType: {
            type: DataTypes.ENUM('email', 'sms', 'push', 'whatsapp'),
            defaultValue: 'email',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        segmentCriteria: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        scheduledAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        totalRecipients: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalSent: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalDelivered: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalOpened: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalClicked: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'paused'),
            defaultValue: 'draft',
        },
    },
    {
        sequelize,
        tableName: 'marketing_campaigns',
    }
);

export default Campaign;
