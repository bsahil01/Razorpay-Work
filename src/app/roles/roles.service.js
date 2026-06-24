import { and, eq } from 'drizzle-orm';
import logger from '../../logger/logger.js';
import AppError from '../../utils/AppError.js';
import { db } from '../../config/db.config.js';
import { users } from '../onboardings/onboardings.schema.js';
import { employee_assignments } from '../employees/employees.schema.js';

const sanitizeUser = (user) => {
	if (!user) return null;
	const { password, ...safeUser } = user;
	return safeUser;
};

const removeEmployeeManagerLinks = async (userId, role) => {
	if (role !== 'RM') {
		await db.delete(employee_assignments).where(eq(employee_assignments.manager_id, userId));
	}

	if (role !== 'EMP') {
		await db.delete(employee_assignments).where(eq(employee_assignments.employee_id, userId));
	}
};

export const assignRole = async (payload, requestingUser) => {
	logger.info('assignRole entry');
	try {
		if (requestingUser.role !== 'CFO') {
			throw new AppError('Access denied', 403);
		}

		if (payload.userId === requestingUser.userId) {
			throw new AppError('CFO cannot change their own role', 400);
		}

		const targetUsers = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.userId))
			.limit(1);

		const targetUser = targetUsers[0];
		if (!targetUser) {
			throw new AppError('User not found', 404);
		}

		await removeEmployeeManagerLinks(payload.userId, payload.role);

		const updatedUsers = await db
			.update(users)
			.set({ role: payload.role })
			.where(eq(users.id, payload.userId))
			.returning();

		return sanitizeUser(updatedUsers[0]);
	} catch (error) {
		logger.error(`assignRole error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to assign role', 500);
	} finally {
		logger.info('assignRole exit');
	}
};

