import { and, eq, inArray } from 'drizzle-orm';
import logger from '../../logger/logger.js';
import AppError from '../../utils/AppError.js';
import { db } from '../../config/db.config.js';
import { users } from '../onboardings/onboardings.schema.js';
import { employee_assignments } from '../employees/employees.schema.js';
import { approvals } from '../approvals/approvals.schema.js';
import { reimbursements } from './reimbursements.schema.js';

const sanitizeAmount = (value) => {
	if (value === null || value === undefined) return value;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? value : parsed;
};

const normalizeDetailedReimbursement = (record, requesterRole) => {
	if (!record) return null;
	const status = requesterRole === 'EMP' && record.status === 'RM_APPROVED' ? 'PENDING' : record.status;
	return {
		id: record.id,
		title: record.title,
		description: record.description,
		amount: sanitizeAmount(record.amount),
		status,
		created_by: record.created_by,
		created_at: record.created_at,
	};
};

const normalizePublicReimbursement = (record, requesterRole) => {
	if (!record) return null;
	const status = requesterRole === 'EMP' && record.status === 'RM_APPROVED' ? 'PENDING' : record.status;
	return {
		title: record.title,
		description: record.description,
		amount: sanitizeAmount(record.amount),
		status,
	};
};

const normalizeReimbursements = (records, requesterRole) => {
	return records.map((record) => normalizePublicReimbursement(record, requesterRole));
};

const throwAlreadyActedError = (error) => {
	if (error?.code === '23505') {
		throw new AppError('Already acted on this reimbursement', 409);
	}
	throw error;
};

const getReimbursementById = async (tx, reimbursementId) => {
	const records = await tx.select().from(reimbursements).where(eq(reimbursements.id, reimbursementId)).limit(1);
	return records[0] || null;
};

const ensureNotFinalized = (reimbursement) => {
	if (['APPROVED', 'REJECTED'].includes(reimbursement.status)) {
		throw new AppError('Reimbursement is already finalized', 400);
	}
};

const insertApprovalAndUpdateStatus = async (
	tx,
	reimbursementId,
	approverId,
	approvalType,
	reimbursementStatus,
	approvalStatus
) => {
	await tx.insert(approvals).values({
		reimbursement_id: reimbursementId,
		approver_id: approverId,
		approval_type: approvalType,
		status: approvalStatus,
	});

	const updated = await tx
		.update(reimbursements)
		.set({ status: reimbursementStatus })
		.where(eq(reimbursements.id, reimbursementId))
		.returning();

	return updated[0];
};

export const createReimbursement = async (payload, requestingUser) => {
	logger.info('createReimbursement entry');
	try {
		if (requestingUser.role !== 'EMP') {
			throw new AppError('Access denied. Only employees can raise reimbursements', 403);
		}

		const created = await db
			.insert(reimbursements)
			.values({
				title: payload.title,
				description: payload.description,
				amount: payload.amount,
				status: 'PENDING',
				created_by: requestingUser.userId,
			})
			.returning();

		return normalizeDetailedReimbursement(created[0], requestingUser.role);
	} catch (error) {
		logger.error(`createReimbursement error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to create reimbursement', 500);
	} finally {
		logger.info('createReimbursement exit');
	}
};

export const updateReimbursement = async (payload, requestingUser) => {
	logger.info('updateReimbursement entry');
	try {
		if (requestingUser.role === 'EMP') {
			throw new AppError('Access denied. Employees cannot edit reimbursements', 403);
		}

		const reimbursement = await getReimbursementById(db, payload.reimbursementId);
		if (!reimbursement) {
			throw new AppError('Reimbursement not found', 404);
		}

		ensureNotFinalized(reimbursement);

		let approvalType;
		let nextStatus;

		if (requestingUser.role === 'RM') {
			if (reimbursement.status !== 'PENDING') {
				throw new AppError('RM can only act on PENDING reimbursements', 403);
			}

			const subordinateAssignments = await db
				.select({ id: employee_assignments.id })
				.from(employee_assignments)
				.where(
					and(
						eq(employee_assignments.employee_id, reimbursement.created_by),
						eq(employee_assignments.manager_id, requestingUser.userId)
					)
				)
				.limit(1);

			if (subordinateAssignments.length === 0) {
				throw new AppError('Access denied. Not your subordinate', 403);
			}

			approvalType = 'RM';
			nextStatus = payload.status === 'APPROVED' ? 'RM_APPROVED' : 'REJECTED';
		} else if (requestingUser.role === 'APE') {
			if (reimbursement.status !== 'RM_APPROVED') {
				throw new AppError('APE can only act on RM approved reimbursements', 403);
			}

			approvalType = 'APE';
			nextStatus = payload.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
		} else if (requestingUser.role === 'CFO') {
			approvalType = 'CFO';
			nextStatus = payload.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
		} else {
			throw new AppError('Access denied', 403);
		}

		const approvalStatus = payload.status;
		const reimbursementStatus =
			requestingUser.role === 'RM' && payload.status === 'APPROVED'
				? 'RM_APPROVED'
				: nextStatus;

		const updated = await db.transaction(async (tx) => {
			try {
				return await insertApprovalAndUpdateStatus(
					tx,
					payload.reimbursementId,
					requestingUser.userId,
					approvalType,
					reimbursementStatus,
					approvalStatus
				);
			} catch (error) {
				throwAlreadyActedError(error);
			}
		});

		return normalizeDetailedReimbursement(updated, requestingUser.role);
	} catch (error) {
		logger.error(`updateReimbursement error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to update reimbursement', 500);
	} finally {
		logger.info('updateReimbursement exit');
	}
};

export const getReimbursements = async (requestingUser) => {
	logger.info('getReimbursements entry');
	try {
		let records = [];

		if (requestingUser.role === 'EMP') {
			records = await db
				.select()
				.from(reimbursements)
				.where(eq(reimbursements.created_by, requestingUser.userId));
		} else if (requestingUser.role === 'RM') {
			const assignments = await db
				.select({ employeeId: employee_assignments.employee_id })
				.from(employee_assignments)
				.where(eq(employee_assignments.manager_id, requestingUser.userId));

			const employeeIds = [...new Set(assignments.map((assignment) => assignment.employeeId))];
			if (employeeIds.length > 0) {
				records = await db
					.select()
					.from(reimbursements)
					.where(and(inArray(reimbursements.created_by, employeeIds), eq(reimbursements.status, 'PENDING')));
			}
		} else if (requestingUser.role === 'APE') {
			records = await db
				.select()
				.from(reimbursements)
				.where(eq(reimbursements.status, 'RM_APPROVED'));
		} else if (requestingUser.role === 'CFO') {
			records = await db
				.select()
				.from(reimbursements)
				.where(eq(reimbursements.status, 'APPROVED'));
		}

		return normalizeReimbursements(records, requestingUser.role);
	} catch (error) {
		logger.error(`getReimbursements error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to fetch reimbursements', 500);
	} finally {
		logger.info('getReimbursements exit');
	}
};

export const getReimbursementsByUserId = async (targetUserId, requestingUser) => {
	logger.info('getReimbursementsByUserId entry');
	try {
		const targetUsers = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
		const targetUser = targetUsers[0];
		if (!targetUser) {
			throw new AppError('User not found', 404);
		}

		if (targetUser.role !== 'EMP') {
			throw new AppError('Target user is not an employee', 400);
		}

		if (requestingUser.role === 'EMP') {
			throw new AppError('Access denied', 403);
		}

		if (requestingUser.role === 'RM') {
			const subordinateAssignments = await db
				.select({ id: employee_assignments.id })
				.from(employee_assignments)
				.where(
					and(
						eq(employee_assignments.employee_id, targetUserId),
						eq(employee_assignments.manager_id, requestingUser.userId)
					)
				)
				.limit(1);

			if (subordinateAssignments.length === 0) {
				throw new AppError('Access denied. Not your subordinate', 403);
			}
		} else if (requestingUser.role === 'APE') {
			const visibleReimbursements = await db
				.select({ id: reimbursements.id })
				.from(reimbursements)
				.where(
					and(
						eq(reimbursements.created_by, targetUserId),
						inArray(reimbursements.status, ['RM_APPROVED', 'APPROVED'])
					)
				)
				.limit(1);

			if (visibleReimbursements.length === 0) {
				throw new AppError('Access denied', 403);
			}
		}

		const records = await db
			.select()
			.from(reimbursements)
			.where(eq(reimbursements.created_by, targetUserId));

		return normalizeReimbursements(records, requestingUser.role);
	} catch (error) {
		logger.error(`getReimbursementsByUserId error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to fetch reimbursements', 500);
	} finally {
		logger.info('getReimbursementsByUserId exit');
	}
};

