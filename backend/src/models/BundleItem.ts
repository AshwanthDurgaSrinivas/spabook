import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Service from './Service';

interface BundleItemAttributes {
    id: number;
    bundleId: number;
    serviceId: number;
    quantity: number;
}

interface BundleItemCreationAttributes extends Optional<BundleItemAttributes, 'id' | 'quantity'> { }

class BundleItem extends Model<BundleItemAttributes, BundleItemCreationAttributes> implements BundleItemAttributes {
    public id!: number;
    public bundleId!: number;
    public serviceId!: number;
    public quantity!: number;
}

BundleItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        bundleId: {
            type: DataTypes.INTEGER,
            references: {
                model: Service,
                key: 'id',
            },
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            references: {
                model: Service,
                key: 'id',
            },
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
    },
    {
        sequelize,
        tableName: 'bundle_items',
    }
);

Service.hasMany(BundleItem, { as: 'bundleItems', foreignKey: 'bundleId' });
BundleItem.belongsTo(Service, { as: 'service', foreignKey: 'serviceId' });

export default BundleItem;
