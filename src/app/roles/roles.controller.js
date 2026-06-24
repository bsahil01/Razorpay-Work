import logger from '../../logger/logger.js';
import { ApiSuccessResponse, asyncHandler } from '../../utils/index.js';
import { assignRole } from './roles.service.js';

export const assignRoleController = asyncHandler(async (req, res) => {
	logger.info('assignRoleController entry');
	try {
		const user = await assignRole(req.body, req.user);
		res.status(200).json(new ApiSuccessResponse('Role assigned successfully', { user }));
	} catch (error) {
		logger.error(`assignRoleController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('assignRoleController exit');
	}
});

