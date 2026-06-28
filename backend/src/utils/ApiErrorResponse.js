export class ApiErrorResponse {
	constructor(message = 'Error', errors = null) {
		this.success = false;
		this.message = message;
		if (errors) this.errors = errors;
	}
}

export default ApiErrorResponse;
