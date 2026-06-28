import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { check, pgTable, timestamp, varchar, text, numeric } from 'drizzle-orm/pg-core';
import { users } from '../onboardings/onboardings.schema.js';

export const createReimbursementSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	amount: z.number().positive('Amount must be a positive number'),
});

export const updateReimbursementSchema = z.object({
	reimbursementId: z.string().uuid('reimbursementId must be a valid UUID'),
	status: z.enum(['APPROVED', 'REJECTED']),
});

export const reimbursements = pgTable('reimbursements', {
	id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description').notNull(),
	amount: numeric('amount').notNull(),
	status: varchar('status', { length: 32 }).notNull().default('PENDING'),
	created_by: varchar('created_by', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
	statusCheck: check(
		'reimbursements_status_check',
		sql`${table.status} IN ('PENDING', 'RM_APPROVED', 'APPROVED', 'REJECTED')`
	),
}));
