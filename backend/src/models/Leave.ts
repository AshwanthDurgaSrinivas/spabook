import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Employee from './Employee';

interface LeaveAttributes {
    id: number;
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: number;
    comment?: string;
}

interface LeaveCreationAttributes extends Optional<LeaveAttributes, 'id' | 'status' | 'approvedBy' | 'comment'> { }

class Leave extends Model<LeaveAttributes, LeaveCreationAttributes> implements LeaveAttributes {
    public id!: number;
    public employeeId!: number;
    public startDate!: string;
    public endDate!: string;
    public reason!: string;
    public status!: 'pending' | 'approved' | 'rejected';
    public approvedBy?: number;
    public comment?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Leave.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.INTEGER,
            references: {
                model: Employee,
                key: 'id',
            },
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        approvedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'leaves',
    }
);

Leave.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Leave, { foreignKey: 'employeeId', as: 'leaves' });

export default Leave;
