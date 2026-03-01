import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

class Setting extends Model {
    public id!: number;
    public key!: string;
    public value!: string;
    public description!: string;
    public isEncrypted!: boolean;
}

Setting.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isEncrypted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'settings',
        timestamps: true,
    }
);

export default Setting;
