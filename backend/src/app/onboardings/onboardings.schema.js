import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { check, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

const orgEmailSchema = z
	.string()
	.email()
	.refine((value) => value.endsWith('@org.com'), {
		message: 'Email must end with @org.com',
	});

export const registerSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: orgEmailSchema,
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
	email: orgEmailSchema,
	password: z.string().min(1, 'Password is required'),
});

export const users = pgTable('users', {
	id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	role: varchar('role', { length: 10 }).notNull().default('EMP'),
	created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
	roleCheck: check(
		'users_role_check',
		sql`${table.role} IN ('EMP', 'RM', 'APE', 'CFO')`
	),
}));

