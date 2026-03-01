import { Request, Response } from 'express';
import JobPosting from '../models/JobPosting';
import JobApplication from '../models/JobApplication';

// ---- POSTINGS ----
export const getJobPostings = async (req: Request, res: Response) => {
    try {
        const jobs = await JobPosting.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
};

export const getJobPostingById = async (req: Request, res: Response) => {
    try {
        const job = await JobPosting.findByPk(parseInt(req.params.id as string));
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error });
    }
};

export const createJobPosting = async (req: Request, res: Response) => {
    try {
        const job = await JobPosting.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: 'Error creating job posting', error });
    }
};

export const updateJobPosting = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const [updated] = await JobPosting.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json({ message: 'Job not found' });
        const updatedJob = await JobPosting.findByPk(id);
        res.json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: 'Error updating job posting', error });
    }
};

export const deleteJobPosting = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const deleted = await JobPosting.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ message: 'Job not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job posting', error });
    }
};


// ---- APPLICATIONS ----
export const submitJobApplication = async (req: Request, res: Response) => {
    try {
        const application = await JobApplication.create(req.body);
        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting application', error });
    }
};

export const getJobApplications = async (req: Request, res: Response) => {
    try {
        const applications = await JobApplication.findAll({
            include: [{ model: JobPosting, as: 'jobPosting', attributes: ['title', 'location'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error });
    }
};

export const getJobApplicationById = async (req: Request, res: Response) => {
    try {
        const application = await JobApplication.findByPk(parseInt(req.params.id as string), {
            include: [{ model: JobPosting, as: 'jobPosting' }]
        });
        if (!application) return res.status(404).json({ message: 'Application not found' });
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application', error });
    }
};

export const updateJobApplicationStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status } = req.body;

        const application = await JobApplication.findByPk(id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        await application.update({ status });
        res.json(application);
    } catch (error) {
        res.status(400).json({ message: 'Error updating application status', error });
    }
};

export const deleteJobApplication = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const deleted = await JobApplication.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ message: 'Application not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting application', error });
    }
};
