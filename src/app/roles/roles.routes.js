import express from 'express';
import { auth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { assignRoleController } from './roles.controller.js';
import { assignRoleSchema } from './roles.schema.js';

const router = express.Router();

router.post('/assign', auth, validate(assignRoleSchema), assignRoleController);

export default router;
