CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(10) DEFAULT 'EMP' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar(255) NOT NULL,
	"manager_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reimbursements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"amount" numeric NOT NULL,
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reimbursement_id" varchar(255) NOT NULL,
	"approver_id" varchar(255) NOT NULL,
	"approval_type" varchar(10) NOT NULL,
	"status" varchar(16) NOT NULL,
	"approved_at" timestamp DEFAULT now()
);
