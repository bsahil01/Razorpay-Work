import { and, eq, inArray, ne } from 'drizzle-orm';
import logger from '../../logger/logger.js';
import AppError from '../../utils/AppError.js';
import { db } from '../../config/db.config.js';
import { users } from '../onboardings/onboardings.schema.js';
import { employee_assignments } from './employees.schema.js';

const sanitizeUsers = (records) => {
	return records.map(({ password, id, ...user }) => ({
		userId: id,
		...user,
	}));
};

const getUserById = async (userId) => {
	const records = await db.select().from(users).where(eq(users.id, userId)).limit(1);
	return records[0] || null;
};

export const getEmployees = async (requestingUser) => {
	logger.info('getEmployees entry');
	try {
		if (requestingUser.role === 'EMP') {
			throw new AppError('Access denied', 403);
		}

		let records = [];

		if (requestingUser.role === 'RM') {
			const assignments = await db
				.select({ employeeId: employee_assignments.employee_id })
				.from(employee_assignments)
				.where(eq(employee_assignments.manager_id, requestingUser.userId));

			const employeeIds = [...new Set(assignments.map((assignment) => assignment.employeeId))];
			if (employeeIds.length > 0) {
				records = await db
					.select()
					.from(users)
					.where(and(inArray(users.id, employeeIds), eq(users.role, 'EMP')));
			}
		} else if (requestingUser.role === 'APE') {
			records = await db
				.select()
				.from(users)
				.where(inArray(users.role, ['EMP', 'RM']));
		} else if (requestingUser.role === 'CFO') {
			records = await db.select().from(users).where(ne(users.id, requestingUser.userId));
		}

		return sanitizeUsers(records);
	} catch (error) {
		logger.error(`getEmployees error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to fetch employees', 500);
	} finally {
		logger.info('getEmployees exit');
	}
};

export const assignEmployee = async (payload, requestingUser) => {
	logger.info('assignEmployee entry');
	try {
		if (requestingUser.role !== 'CFO') {
			throw new AppError('Access denied', 403);
		}

		const employee = await getUserById(payload.employeeId);
		if (!employee) {
			throw new AppError('Employee not found', 404);
		}
		if (employee.role !== 'EMP') {
			throw new AppError('User is not an EMP', 400);
		}

		const manager = await getUserById(payload.managerId);
		if (!manager) {
			throw new AppError('Manager not found', 404);
		}
		if (manager.role !== 'RM') {
			throw new AppError('User is not an RM', 400);
		}

		const existingAssignments = await db
			.select({ id: employee_assignments.id })
			.from(employee_assignments)
			.where(eq(employee_assignments.employee_id, payload.employeeId))
			.limit(1);

		if (existingAssignments.length > 0) {
			throw new AppError('Employee is already assigned to a manager', 409);
		}

		const insertedAssignments = await db
			.insert(employee_assignments)
			.values({
				employee_id: payload.employeeId,
				manager_id: payload.managerId,
			})
			.returning();

		return insertedAssignments[0];
	} catch (error) {
		logger.error(`assignEmployee error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to assign employee', 500);
	} finally {
		logger.info('assignEmployee exit');
	}
};

export const removeAssignment = async (payload, requestingUser) => {
	logger.info('removeAssignment entry');
	try {
		if (requestingUser.role !== 'CFO') {
			throw new AppError('Access denied', 403);
		}

		const assignments = await db
			.select()
			.from(employee_assignments)
			.where(
				and(
					eq(employee_assignments.employee_id, payload.employeeId),
					eq(employee_assignments.manager_id, payload.managerId)
				)
			)
			.limit(1);

		const assignment = assignments[0];
		if (!assignment) {
			throw new AppError('Assignment not found', 404);
		}

		await db.delete(employee_assignments).where(eq(employee_assignments.id, assignment.id));

		return { message: 'Assignment removed' };
	} catch (error) {
		logger.error(`removeAssignment error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to remove assignment', 500);
	} finally {
		logger.info('removeAssignment exit');
	}
};

