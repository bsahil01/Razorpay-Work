export class ApiSuccessResponse {
	constructor(message = 'OK', data = {}) {
		this.success = true;
		this.message = message;
		this.data = data;
	}
}

export default ApiSuccessResponse;
