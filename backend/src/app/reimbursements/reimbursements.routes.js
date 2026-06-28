import express from 'express';
import { auth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
	createReimbursementController,
	getReimbursementsByUserIdController,
	getReimbursementsController,
	updateReimbursementController,
} from './reimbursements.controller.js';
import { createReimbursementSchema, updateReimbursementSchema } from './reimbursements.schema.js';

const router = express.Router();

router.post('/', auth, validate(createReimbursementSchema), createReimbursementController);
router.patch('/', auth, validate(updateReimbursementSchema), updateReimbursementController);
router.get('/', auth, getReimbursementsController);
router.get('/:userId', auth, getReimbursementsByUserIdController);

export default router;
