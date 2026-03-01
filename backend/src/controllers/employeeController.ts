import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Employee from '../models/Employee';
import User from '../models/User';
import Booking from '../models/Booking'; // For availability check later

export const getEmployees = async (req: Request, res: Response) => {
    try {
        const employees = await Employee.findAll({
            order: [['id', 'ASC']]
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error });
    }
};

export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const employee = await Employee.findByPk(parseInt(req.params.id as string));
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error });
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(process.cwd(), 'debug_employee.log');

    const log = (msg: string, data?: any) => {
        try {
            const line = `[${new Date().toISOString()}] ${msg} ${data ? JSON.stringify(data) : ''}\n`;
            fs.appendFileSync(logFile, line);
            console.log(msg, data);
        } catch (e) {
            console.error('Logging failed:', e);
        }
    };

    try {
        log('Recieved createEmployee request');
        log('Request body:', req.body);

        const { firstName, lastName, email, phone, password, ...employeeData } = req.body;

        if (!email || !firstName || !lastName) {
            log('Missing required fields');
            return res.status(400).json({ message: 'Missing required fields: firstName, lastName, email' });
        }

        // check if employee with email already exists
        const existingEmployee = await Employee.findOne({ where: { email } });
        if (existingEmployee) {
            return res.status(409).json({ message: 'Employee with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password || 'password123', 10);

        const employeePayload = {
            ...employeeData,
            firstName,
            lastName,
            email,
            phone,
            passwordHash: hashedPassword,
            role: employeeData.role || 'employee',
            status: 'active'
        };
        console.log('Employee Payload:', JSON.stringify(employeePayload, null, 2));

        // Create employee profile
        const employee = await Employee.create(employeePayload);

        res.status(201).json(employee);
    } catch (error: any) {
        const fs = require('fs');
        const path = require('path');
        // Robust logging path to project root
        const logPath = path.join(process.cwd(), 'error.log');

        const errorDetails = {
            message: error.message,
            stack: error.stack,
            validationErrors: error.errors?.map((e: any) => e.message),
            payload: req.body
        };
        try {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Create Employee Error: ${JSON.stringify(errorDetails, null, 2)}\n`);
        } catch (logError) {
            console.error('Failed to write to error log:', logError);
        }
        console.error('Create Employee Error:', errorDetails);

        let clientMessage = 'Error creating employee profile';
        if (error.name === 'SequelizeValidationError') {
            clientMessage = error.errors.map((e: any) => e.message).join(', ');
        } else if (error.message) {
            clientMessage = error.message;
        }

        res.status(400).json({ message: clientMessage, error: error.message });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const { user: userData, ...employeeData } = req.body;
        const employeeId = parseInt(req.params.id as string);

        const employee = await Employee.findByPk(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Update employee details directly
        await employee.update(employeeData);

        const updatedEmployee = await Employee.findByPk(employeeId);
        res.json(updatedEmployee);
    } catch (error) {
        console.error('Update Employee Error:', error);
        res.status(400).json({ message: 'Error updating employee', error });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const employeeId = parseInt(req.params.id as string);
        const employee = await Employee.findByPk(employeeId);

        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // 1. Unlink bookings
        await Booking.update({ employeeId: null }, { where: { employeeId } });

        // 2. Delete employee profile
        await employee.destroy();

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Delete Employee Error:', error);
        res.status(500).json({ message: 'Error deleting employee.' });
    }
};
