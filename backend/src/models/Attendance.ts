import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Employee from './Employee';

interface AttendanceAttributes {
    id: number;
    employeeId: number;
    date: string; // YYYY-MM-DD
    checkInTime: Date;
    checkOutTime: Date;
    breakMinutes: number;
    lastBreakStart: Date | null;
    status: 'present' | 'absent' | 'leave' | 'half_day' | 'late';
    notes: string;
}

interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'checkOutTime' | 'notes' | 'breakMinutes' | 'lastBreakStart'> { }

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
    public id!: number;
    public employeeId!: number;
    public date!: string;
    public checkInTime!: Date;
    public checkOutTime!: Date;
    public breakMinutes!: number;
    public lastBreakStart!: Date | null;
    public status!: 'present' | 'absent' | 'leave' | 'half_day' | 'late';
    public notes!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Attendance.init(
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        checkInTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        checkOutTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        breakMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lastBreakStart: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('present', 'absent', 'leave', 'half_day', 'late'),
            defaultValue: 'present',
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'attendances',
    }
);

Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });
Employee.hasMany(Attendance, { foreignKey: 'employeeId' });

export default Attendance;
