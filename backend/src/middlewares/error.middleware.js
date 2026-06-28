import logger from '../logger/logger.js';
import AppError from '../utils/AppError.js';
import { ApiErrorResponse } from '../utils/ApiErrorResponse.js';

export const errorHandler = (err, req, res, next) => {
	logger.error(`Error middleware caught: ${err?.stack || err}`);
	if (err instanceof AppError || err?.isOperational) {
		const status = err.statusCode || 400;
		return res.status(status).json(new ApiErrorResponse(err.message, err.errors));
	}

	return res.status(500).json({ success: false, message: 'Internal Server Error' });
};

export default errorHandler;
