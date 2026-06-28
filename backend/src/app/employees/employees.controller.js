import logger from '../../logger/logger.js';
import { ApiSuccessResponse, asyncHandler } from '../../utils/index.js';
import { assignEmployee, getEmployees, removeAssignment } from './employees.service.js';

export const getEmployeesController = asyncHandler(async (req, res) => {
    logger.info('getEmployeesController entry');
    try {
        const users = await getEmployees(req.user);
        res.status(200).json({
            status: 'success',
            data: { users },
        });
    } catch (error) {
        logger.error(`getEmployeesController error: ${error?.message || error}`);
        throw error;
    } finally {
        logger.info('getEmployeesController exit');
    }
});

export const assignEmployeeController = asyncHandler(async (req, res) => {
    logger.info('assignEmployeeController entry');
    try {
        const assignment = await assignEmployee(req.body, req.user);
        res.status(201).json(
            new ApiSuccessResponse('Employee assigned successfully', { assignment })
        );
    } catch (error) {
        logger.error(`assignEmployeeController error: ${error?.message || error}`);
        throw error;
    } finally {
        logger.info('assignEmployeeController exit');
    }
});

export const removeAssignmentController = asyncHandler(async (req, res) => {
    logger.info('removeAssignmentController entry');
    try {
        await removeAssignment(req.body, req.user);
        res.status(200).json(
            new ApiSuccessResponse('Assignment removed successfully', {})
        );
    } catch (error) {
        logger.error(`removeAssignmentController error: ${error?.message || error}`);
        throw error;
    } finally {
        logger.info('removeAssignmentController exit');
    }
});