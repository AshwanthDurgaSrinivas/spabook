import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface GeofenceLocationAttributes {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // in meters
    isActive: boolean;
}

interface GeofenceLocationCreationAttributes extends Optional<GeofenceLocationAttributes, 'id' | 'isActive'> { }

class GeofenceLocation extends Model<GeofenceLocationAttributes, GeofenceLocationCreationAttributes> implements GeofenceLocationAttributes {
    public id!: number;
    public name!: string;
    public latitude!: number;
    public longitude!: number;
    public radius!: number;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

GeofenceLocation.init(
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
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
        },
        radius: {
            type: DataTypes.INTEGER,
            defaultValue: 100, // 100 meters
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'geofence_locations',
    }
);

export default GeofenceLocation;
