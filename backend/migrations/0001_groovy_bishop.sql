ALTER TABLE "employee_assignments" ADD CONSTRAINT "employee_assignments_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_assignments" ADD CONSTRAINT "employee_assignments_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reimbursements" ADD CONSTRAINT "reimbursements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_reimbursement_id_reimbursements_id_fk" FOREIGN KEY ("reimbursement_id") REFERENCES "public"."reimbursements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "approvals_reimbursement_id_approval_type_unique" ON "approvals" USING btree ("reimbursement_id","approval_type");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "employee_assignments" ADD CONSTRAINT "employee_assignments_employee_id_unique" UNIQUE("employee_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('EMP', 'RM', 'APE', 'CFO'));--> statement-breakpoint
ALTER TABLE "reimbursements" ADD CONSTRAINT "reimbursements_status_check" CHECK ("reimbursements"."status" IN ('PENDING', 'RM_APPROVED', 'APPROVED', 'REJECTED'));--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approval_type_check" CHECK ("approvals"."approval_type" IN ('RM', 'APE', 'CFO'));--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_status_check" CHECK ("approvals"."status" IN ('APPROVED', 'REJECTED'));