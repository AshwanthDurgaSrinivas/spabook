import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CouponAttributes {
    id: number;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed_amount';
    value: number;
    minPurchaseAmount: number;
    maxDiscountAmount: number;
    startDate: Date;
    endDate: Date;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
    membershipId?: number | null; // Specific membership plan
    isMembersOnly: boolean; // True if it applies to ANY membership holder
}

interface CouponCreationAttributes extends Optional<CouponAttributes, 'id' | 'membershipId'> { }

class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
    public id!: number;
    public code!: string;
    public description!: string;
    public discountType!: 'percentage' | 'fixed_amount';
    public value!: number;
    public minPurchaseAmount!: number;
    public maxDiscountAmount!: number;
    public startDate!: Date;
    public endDate!: Date;
    public usageLimit!: number;
    public usedCount!: number;
    public isActive!: boolean;
    public membershipId!: number | null;
    public isMembersOnly!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Coupon.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        discountType: {
            type: DataTypes.ENUM('percentage', 'fixed_amount'),
            defaultValue: 'fixed_amount',
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        minPurchaseAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        maxDiscountAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        usageLimit: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // 0 for unlimited? Or null? Let's say 0 is unlimited for simplicity or use null. 
            // Actually let's use a high number or explicit check.
            allowNull: true,
        },
        usedCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        membershipId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'membership_plans',
                key: 'id'
            }
        },
        isMembersOnly: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'coupons',
    }
);
export default Coupon;
