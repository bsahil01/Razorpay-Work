import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { auth } from '../../middlewares/auth.middleware.js';
import { loginController, logoutController, registerController } from './onboardings.controller.js';
import { loginSchema, registerSchema } from './onboardings.schema.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', auth, logoutController);

export default router;
