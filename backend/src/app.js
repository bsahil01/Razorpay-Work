import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import logger from './logger/logger.js';
import errorHandler from './middlewares/error.middleware.js';

import onboardingsRoutes from './app/onboardings/onboardings.routes.js';
import rolesRoutes from './app/roles/roles.routes.js';
import employeesRoutes from './app/employees/employees.routes.js';
import reimbursementsRoutes from './app/reimbursements/reimbursements.routes.js';

const createApp = () => {
	const app = express();

	app.use(cors(
		{
			origin: "http://localhost:5173",
			credentials: true,
		}
	));
	app.use(helmet());
	app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
	app.use(express.json());
	app.use(cookieParser());

	app.get('/health', (req, res) => res.json({ success: true, message: 'OK' }));

	app.use('/rest/onboardings', onboardingsRoutes);
	app.use('/rest/roles', rolesRoutes);
	app.use('/rest/employees', employeesRoutes);
	app.use('/rest/reimbursements', reimbursementsRoutes);

	// error handler last
	app.use(errorHandler);

	return app;
};

export default createApp;
