import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const {
	PORT,
	DATABASE_URL,
	JWT_SECRET,
	BCRYPT_SALT_ROUNDS,
} = process.env;

const missing = [];
if (!PORT) missing.push('PORT');
if (!DATABASE_URL) missing.push('DATABASE_URL');
if (!JWT_SECRET) missing.push('JWT_SECRET');
if (!BCRYPT_SALT_ROUNDS) missing.push('BCRYPT_SALT_ROUNDS');

if (missing.length) {
	throw new Error(`Missing required env variables: ${missing.join(', ')}`);
}

export {};
