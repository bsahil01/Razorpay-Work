import { z } from 'zod';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';

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
		employee_id: varchar('employee_id', { length: 255 }).notNull(),
		manager_id: varchar('manager_id', { length: 255 }).notNull(),
	}
);
