import './env.config.js';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import logger from '../logger/logger.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let db;
try {
	db = drizzle(pool);
	logger.info('Drizzle DB client initialized');
} catch (err) {
	logger.error(`Failed to initialize DB: ${err?.message || err}`);
	throw err;
}

export { db, pool };
