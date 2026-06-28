import express from 'express';
import { auth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
	assignEmployeeController,
	getEmployeesController,
	removeAssignmentController,
} from './employees.controller.js';
import {
	assignEmployeeSchema,
	removeAssignmentSchema,
} from './employees.schema.js';

const router = express.Router();

router.get('/', auth, getEmployeesController);
router.post('/assign', auth, validate(assignEmployeeSchema), assignEmployeeController);
router.delete('/assign', auth, validate(removeAssignmentSchema), removeAssignmentController);

export default router;
