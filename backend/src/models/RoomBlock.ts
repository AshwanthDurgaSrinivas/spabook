import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Room from './Room';

interface RoomBlockAttributes {
    id: number;
    roomId: number;
    date: string;           // 'YYYY-MM-DD'
    reason: string | null;
    blockedBy: number | null; // admin userId
}

interface RoomBlockCreationAttributes extends Optional<RoomBlockAttributes, 'id' | 'reason' | 'blockedBy'> { }

class RoomBlock extends Model<RoomBlockAttributes, RoomBlockCreationAttributes>
    implements RoomBlockAttributes {
    public id!: number;
    public roomId!: number;
    public date!: string;
    public reason!: string | null;
    public blockedBy!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

RoomBlock.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        roomId: { type: DataTypes.INTEGER, allowNull: false },
        date: { type: DataTypes.DATEONLY, allowNull: false },
        reason: { type: DataTypes.STRING, allowNull: true },
        blockedBy: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        sequelize,
        tableName: 'room_blocks',
        indexes: [{ unique: true, fields: ['roomId', 'date'] }],
    }
);

RoomBlock.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });
Room.hasMany(RoomBlock, { foreignKey: 'roomId', as: 'blocks' });

export default RoomBlock;
