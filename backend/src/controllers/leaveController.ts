import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Leave from '../models/Leave';
import Employee from '../models/Employee';

export const applyLeave = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate, reason } = req.body;
        const { id, email } = req.user;
        let employee = await Employee.findByPk(id);
        if (!employee) {
            employee = await Employee.findOne({ where: { email } });
        }
        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        const leave = await Leave.create({
            employeeId: employee.id,
            startDate,
            endDate,
            reason,
            status: 'pending'
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Error applying for leave', error });
    }
};

export const getMyLeaves = async (req: AuthRequest, res: Response) => {
    try {
        const { id, email } = req.user;
        let employee = await Employee.findByPk(id);
        if (!employee) {
            employee = await Employee.findOne({ where: { email } });
        }

        if (!employee) {
            return res.json([]);
        }

        const leaves = await Leave.findAll({
            where: { employeeId: employee.id },
            order: [['startDate', 'DESC']]
        });
        res.json(leaves);
    } catch (error) {
        console.error('Error fetching my leaves:', error);
        res.status(500).json({ message: 'Error fetching leaves' });
    }
};

export const getAllLeaves = async (req: AuthRequest, res: Response) => {
    try {
        const { role, id, email } = req.user;
        let where: any = {};

        // If manager, only show leaves for staff roles (exclude managers and admins)
        if (role === 'manager') {
            // Find the manager's employee record to get their ID if needed, 
            // but role filtering is safer for "all employees"
            where = {
                '$employee.role$': ['therapist', 'receptionist', 'employee']
            };
        }

        const leaves = await Leave.findAll({
            where,
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['firstName', 'lastName', 'role']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(leaves);
    } catch (error) {
        console.error('Error fetching all leaves:', error);
        res.status(500).json({ message: 'Error fetching all leaves' });
    }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;
        const managerId = req.user.id;
        const managerRole = req.user.role;

        const leave = await Leave.findByPk(parseInt(id as string), {
            include: [{ model: Employee, as: 'employee' }]
        });

        if (!leave) return res.status(404).json({ message: 'Leave request not found' });

        // Authorization Logic:
        // Manager can approve for Therapist and Receptionist
        // Admin can approve for all roles (including Manager)
        const targetRole = (leave as any).employee.role;

        if (managerRole === 'manager') {
            if (targetRole !== 'therapist' && targetRole !== 'receptionist' && targetRole !== 'employee') {
                return res.status(403).json({ message: 'Managers can only approve leaves for staff roles' });
            }
        } else if (managerRole !== 'admin' && managerRole !== 'super_admin') {
            return res.status(403).json({ message: 'Unauthorized to update leave status' });
        }

        leave.status = status;
        leave.comment = comment;
        leave.approvedBy = managerId;
        await leave.save();

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Error updating leave status', error });
    }
};
