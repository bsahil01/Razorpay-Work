import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { users } from '../onboardings/onboardings.schema.js';

export const assignEmployeeSchema = z.object({
	employeeId: z.string().uuid('employeeId must be a valid UUID'),
	managerId: z.string().uuid('managerId must be a valid UUID'),
});

export const removeAssignmentSchema = z.object({
	employeeId: z.string().uuid('employeeId must be a valid UUID'),
	managerId: z.string().uuid('managerId must be a valid UUID'),
});

export const employee_assignments = pgTable(
	'employee_assignments',
	{
		id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
		employee_id: varchar('employee_id', { length: 255 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
			.unique(),
		manager_id: varchar('manager_id', { length: 255 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
	}
);
