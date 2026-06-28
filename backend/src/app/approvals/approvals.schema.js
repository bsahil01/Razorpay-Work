import { sql } from 'drizzle-orm';
import { check, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { reimbursements } from '../reimbursements/reimbursements.schema.js';
import { users } from '../onboardings/onboardings.schema.js';

export const approvals = pgTable('approvals', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  reimbursement_id: varchar('reimbursement_id', { length: 255 })
    .notNull()
    .references(() => reimbursements.id, { onDelete: 'cascade' }),
  approver_id: varchar('approver_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  approval_type: varchar('approval_type', { length: 10 }).notNull(),
  status: varchar('status', { length: 16 }).notNull(),
  approved_at: timestamp('approved_at').defaultNow(),
}, (table) => ({
	approvalTypeUnique: uniqueIndex('approvals_reimbursement_id_approval_type_unique').on(
		table.reimbursement_id,
		table.approval_type
 	),
  approvalTypeCheck: check(
    'approvals_approval_type_check',
    sql`${table.approval_type} IN ('RM', 'APE', 'CFO')`
  ),
  statusCheck: check(
    'approvals_status_check',
    sql`${table.status} IN ('APPROVED', 'REJECTED')`
  ),
}));
