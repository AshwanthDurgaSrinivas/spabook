import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MembershipPlanAttributes {
    id: number;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    discountPercentage: number;
    benefits: string[];
    isActive: boolean;
}

interface MembershipPlanCreationAttributes extends Optional<MembershipPlanAttributes, 'id'> { }

class MembershipPlan extends Model<MembershipPlanAttributes, MembershipPlanCreationAttributes> implements MembershipPlanAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public price!: number;
    public durationDays!: number;
    public discountPercentage!: number;
    public benefits!: string[];
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MembershipPlan.init(
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        durationDays: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
        },
        discountPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        benefits: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'membership_plans',
    }
);
export default MembershipPlan;
