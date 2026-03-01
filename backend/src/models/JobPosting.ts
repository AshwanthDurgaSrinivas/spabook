import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface JobPostingAttributes {
    id: number;
    title: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    requirements: string[];
    isActive: boolean;
}

interface JobPostingCreationAttributes extends Optional<JobPostingAttributes, 'id' | 'isActive'> { }

class JobPosting extends Model<JobPostingAttributes, JobPostingCreationAttributes> implements JobPostingAttributes {
    public id!: number;
    public title!: string;
    public location!: string;
    public type!: string;
    public salary!: string;
    public description!: string;
    public requirements!: string[];
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

JobPosting.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        salary: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        requirements: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'job_postings',
    }
);

export default JobPosting;
