import jwt from 'jsonwebtoken';
import '../../config/env.config.js';
import logger from '../../logger/logger.js';
import { ApiSuccessResponse, asyncHandler } from '../../utils/index.js';
import { logoutUser, loginUser, registerUser } from './onboardings.service.js';

const authCookieOptions = {
	httpOnly: true,
	sameSite: 'strict',
};

export const registerController = asyncHandler(async (req, res) => {
	logger.info('registerController entry');
	try {
		const user = await registerUser(req.body);
		const token = jwt.sign(
			{ userId: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		);

		res.cookie('auth', token, authCookieOptions);
		res.status(201).json(new ApiSuccessResponse('Registration successful', { user }));
	} catch (error) {
		logger.error(`registerController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('registerController exit');
	}
});

export const loginController = asyncHandler(async (req, res) => {
	logger.info('loginController entry');
	try {
		const { token, user } = await loginUser(req.body);

		res.cookie('auth', token, authCookieOptions);
		res.status(200).json(new ApiSuccessResponse('Login successful', { user }));
	} catch (error) {
		logger.error(`loginController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('loginController exit');
	}
});

export const logoutController = asyncHandler(async (req, res) => {
	logger.info('logoutController entry');
	try {
		await logoutUser();
		res.clearCookie('auth', authCookieOptions);
		res.status(200).json(new ApiSuccessResponse('Logout successful', {}));
	} catch (error) {
		logger.error(`logoutController error: ${error?.message || error}`);
		throw error;
	} finally {
		logger.info('logoutController exit');
	}
});

