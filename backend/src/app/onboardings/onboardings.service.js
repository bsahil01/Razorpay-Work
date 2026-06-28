import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import logger from '../../logger/logger.js';
import AppError from '../../utils/AppError.js';
import { db } from '../../config/db.config.js';
import { users } from './onboardings.schema.js';

const sanitizeUser = (user) => {
	if (!user) return null;
	const { password, ...safeUser } = user;
	return safeUser;
};

export const registerUser = async (payload) => {
	logger.info('registerUser entry');
	try {
		const existingUsers = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, payload.email))
			.limit(1);

		if (existingUsers.length > 0) {
			throw new AppError('Email already registered', 409);
		}

		const hashedPassword = await bcrypt.hash(
			payload.password,
			numberOrDefault(process.env.BCRYPT_SALT_ROUNDS, 10)
		);

		const insertedUsers = await db
			.insert(users)
			.values({
				name: payload.name,
				email: payload.email,
				password: hashedPassword,
				role: 'EMP',
			})
			.returning();

		return sanitizeUser(insertedUsers[0]);
	} catch (error) {
		logger.error(`registerUser error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to register user', 500);
	} finally {
		logger.info('registerUser exit');
	}
};

export const loginUser = async (payload) => {
	logger.info('loginUser entry');
	try {
		const foundUsers = await db
			.select()
			.from(users)
			.where(eq(users.email, payload.email))
			.limit(1);

		const user = foundUsers[0];
		if (!user) {
			throw new AppError('Invalid credentials', 401);
		}

		const isPasswordValid = await bcrypt.compare(payload.password, user.password);
		if (!isPasswordValid) {
			throw new AppError('Invalid credentials', 401);
		}

		const token = jwt.sign(
			{ userId: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		);

		return { token, user: sanitizeUser(user) };
	} catch (error) {
		logger.error(`loginUser error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to login', 500);
	} finally {
		logger.info('loginUser exit');
	}
};

export const logoutUser = async () => {
	logger.info('logoutUser entry');
	try {
		return {};
	} catch (error) {
		logger.error(`logoutUser error: ${error?.message || error}`);
		throw error instanceof AppError ? error : new AppError('Failed to logout', 500);
	} finally {
		logger.info('logoutUser exit');
	}
};

const numberOrDefault = (value, fallback) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

