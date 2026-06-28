import AppError from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		throw new AppError('Validation failed', 400, result.error.format());
	}
	req.body = result.data;
	return next();
};

export default validate;
