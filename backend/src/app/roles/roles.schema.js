import { z } from 'zod';

export const assignRoleSchema = z.object({
	userId: z.string().uuid('userId must be a valid UUID'),
	role: z.enum(['EMP', 'RM', 'APE', 'CFO']),
});

