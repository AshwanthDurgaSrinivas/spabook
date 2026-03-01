import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import JobPosting from './JobPosting';

interface JobApplicationAttributes {
    id: number;
    jobPostingId: number;
    name: string;
    email: string;
    phone: string;
    resumeUrl: string;
    coverLetter?: string;
    status: 'new' | 'reviewing' | 'interviewed' | 'hired' | 'rejected';
}

interface JobApplicationCreationAttributes extends Optional<JobApplicationAttributes, 'id' | 'status' | 'coverLetter'> { }

class JobApplication extends Model<JobApplicationAttributes, JobApplicationCreationAttributes> implements JobApplicationAttributes {
    public id!: number;
    public jobPostingId!: number;
    public name!: string;
    public email!: string;
    public phone!: string;
    public resumeUrl!: string;
    public coverLetter?: string;
    public status!: 'new' | 'reviewing' | 'interviewed' | 'hired' | 'rejected';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

JobApplication.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        jobPostingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: JobPosting,
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        resumeUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coverLetter: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('new', 'reviewing', 'interviewed', 'hired', 'rejected'),
            defaultValue: 'new',
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'job_applications',
    }
);

JobApplication.belongsTo(JobPosting, { foreignKey: 'jobPostingId', as: 'jobPosting' });
JobPosting.hasMany(JobApplication, { foreignKey: 'jobPostingId', as: 'applications' });

export default JobApplication;
