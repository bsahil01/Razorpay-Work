import logger from '../../logger/logger.js';
import { ApiSuccessResponse, asyncHandler } from '../../utils/index.js';
import {
	createReimbursement,
	getReimbursements,
	getReimbursementsByUserId,
	updateReimbursement,
} from './reimbursements.service.js';

export const createReimbursementController = asyncHandler(async (req, res) => {
	logger.info('createReimbursementController entry');
	try {
		const reimbursement = await createReimbursement(req.body, req.user);
		res.status(201).json(
			new ApiSuccessResponse('Reimbursement raised successfully', { reimbursement })
		);
	} catch (error) {
		logger.error(`createReimbursementController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('createReimbursementController exit');
	}
});

export const updateReimbursementController = asyncHandler(async (req, res) => {
	logger.info('updateReimbursementController entry');
	try {
		const reimbursement = await updateReimbursement(req.body, req.user);
		res.status(200).json(
			new ApiSuccessResponse('Reimbursement updated successfully', { reimbursement })
		);
	} catch (error) {
		logger.error(`updateReimbursementController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('updateReimbursementController exit');
	}
});

export const getReimbursementsController = asyncHandler(async (req, res) => {
	logger.info('getReimbursementsController entry');
	try {
		const reimbursements = await getReimbursements(req.user);
		res.status(200).json({
			status: 'success',
			data: { reimbursements },
		});
	} catch (error) {
		logger.error(`getReimbursementsController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('getReimbursementsController exit');
	}
});

export const getReimbursementsByUserIdController = asyncHandler(async (req, res) => {
	logger.info('getReimbursementsByUserIdController entry');
	try {
		const reimbursements = await getReimbursementsByUserId(req.params.userId, req.user);
		res.status(200).json({
			status: 'success',
			data: { reimbursements },
		});
	} catch (error) {
		logger.error(`getReimbursementsByUserIdController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('getReimbursementsByUserIdController exit');
	}
});

