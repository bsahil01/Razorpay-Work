import jwt from 'jsonwebtoken';
import '../config/env.config.js';
import AppError from '../utils/AppError.js';

export const auth = (req, res, next) => {
	const token = req.cookies?.auth || req.cookies?.token;
	if (!token) {
		throw new AppError('Authentication token missing', 401);
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		return next();
	} catch (err) {
		throw new AppError('Invalid authentication token', 401);
	}
};

export default auth;
