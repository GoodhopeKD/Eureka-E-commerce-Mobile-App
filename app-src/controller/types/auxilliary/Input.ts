import moment from 'moment';
import { store } from '../../config/redux.config';

function create_UUID() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = ((dt + Math.random() * 16) % 16) | 0;
		dt = Math.floor(dt / 16);
		return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
	return uuid;
}

enum local_validation_param {
	email = 'email',
	name = 'name',
	username = 'username',
	password = 'password',
	datetime = 'datetime',
	discount_code = 'discount_code',
	number = "number",
}

enum remote_validation_param {
	discount_code = 'discount_code'
}

enum unique_param {
	email = 'email',
	username = 'username'
}

export default class Input {
	private _input: any;

	private _is_valid_email: boolean | null = null;
	private _is_valid_username: boolean | null = null;
	private _is_valid_name: boolean | null = null;

	private _is_valid_discount_code: boolean | null = null;
	private _is_valid_number: boolean | null = null;

	private _is_unique_email: boolean | null = null;
	private _is_unique_username: boolean | null = null;

	private _has_error: boolean = false;
	private _has_check_error: boolean = false;

	constructor(input: any = null) {
		this._input = input ? input : '';
	}

	toString(): string {
		return this._input;
	}

	sanitize(): void { }

	async async_checkIfValid(validation_param: remote_validation_param) {
		await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: '/check_valid/{validation_param}/{test_value}',
				data: { validation_param, test_value: this._input }
			})
			.then((response: any) => {
				if (validation_param === 'discount_code') this._is_valid_discount_code = response.found;

				this._has_error = !response.found;
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				this._has_check_error = true;
				return Promise.reject(error);
			});
	}

	isValid(validation_param: local_validation_param, min_length: number = 2, max_length: number = 64): boolean {
		if (validation_param === 'email') {
			this._is_valid_email =
				this._is_valid_email !== null
					? this._is_valid_email
					: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(
						this._input
					);
			this._has_error = !this._is_valid_email;
			return this._is_valid_email;
		}

		if (validation_param === 'username') {
			this._is_valid_username =
				this._is_valid_username !== null
					? this._is_valid_username
					: /^[a-zA-Z0-9_À-ÿ\u00f1\u00d1]+$/.test(this._input) && (this._input.length >= 5 && this._input.length <= 64);
			this._has_error = !this._is_valid_username;
			return this._is_valid_username;
		}

		if (validation_param === 'name') {
			this._is_valid_name =
				/^[a-zA-Z0-9 -_()À-ÿ\u00f1\u00d1]+$/.test(this._input) &&
				(this._input.length >= min_length && this._input.length <= max_length);
			this._has_error = !this._is_valid_name;
			return this._is_valid_name;
		}

		if (validation_param === 'password') {
			let min_length = 8;
			let max_length = 64;

			let contains_uppercase = /[A-Z]/.test(this._input); // Contains at least 1 uppercase letter
			let contains_lowercase = /[a-z]/.test(this._input); // Contains at least 1 lowercase letter
			let contains_number = /[0-9]/.test(this._input); // Contains at least 1 number
			let is_between_bounds = this._input.length >= min_length && this._input.length <= max_length;

			let is_valid_passsword =
				is_between_bounds &&
				contains_uppercase &&
				contains_lowercase &&
				contains_number &&
				/^[a-zA-Z0-9À-ÿ\u00f1\u00d1 !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+$/.test(this._input);
			this._has_error = !is_valid_passsword;
			return is_valid_passsword;
		}

		if (validation_param === 'datetime') {
			let is_valid_datetime = moment(this._input).isValid();
			this._has_error = !is_valid_datetime;
			return is_valid_datetime;
		}

		if (validation_param === 'discount_code')
			return this._is_valid_discount_code !== null ? this._is_valid_discount_code : false;

		if (validation_param === 'number') {
			const min_int_val = min_length
			const max_int_val = max_length
			this._is_valid_number = !isNaN(this._input) && !isNaN(parseFloat(this._input)) && this._input >= min_int_val && this._input <= max_int_val
			this._has_error = !this._is_valid_number;
			return this._is_valid_number;
		}

		return false;
	}

	async async_checkIfUnique(resource_name: unique_param) {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint: 'core/check/exists/{resource_name}/{test_value}',
				data: { resource_name, test_value: this._input }
			})
			.then((response: any) => {
				if (resource_name === 'email') this._is_unique_email = !response.found;

				if (resource_name === 'username') this._is_unique_username = !response.found;

				this._has_error = response.found;
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				this._has_check_error = true;
				return Promise.reject(error);
			});
	}

	isUnique(resource_name: unique_param): boolean {
		if (resource_name === 'email') return this._is_unique_email !== null ? this._is_unique_email : false;

		if (resource_name === 'username') return this._is_unique_username !== null ? this._is_unique_username : false;

		return false;
	}

	isSafeText(min_length: number = 2, max_length: number = 255): boolean {
		const blacklist = ["https://",'http://','www.']
		let is_safe_text = this._input.length >= min_length && this._input.length <= max_length && /^[a-zA-Z0-9À-ÿ\u00f1\u00d1 !"#$%&'()*+,-./:;=?@[\]^_`{|}~\r\n\u2700-\u27bf\ud83c\udde6-\uddff\ud800-\udbff\udc00-\udfff\u0023-\u0039\ufe0f?\u20e3\u3299\u3297\u303d\u3030\u24c2\ud83c\udd70-\udd71\ud83c\udd7e-\udd7f\ud83c\udd8e\ud83c\udd91-\udd9a\ud83c\udde6-\uddff\ud83c\ude01-\ude02\ud83c\ude1a\ud83c\ude2f\ud83c\ude32-\ude3a\ud83c\ude50-\ude51\u203c\u2049\u25aa-\u25ab\u25b6\u25c0\u25fb-\u25fe\u00a9\u00ae\u2122\u2139\ud83c\udc04\u2600-\u26FF\u2b05\u2b06\u2b07\u2b1b\u2b1c\u2b50\u2b55\u231a\u231b\u2328\u23cf\u23e9-\u23f3\u23f8-\u23fa\ud83c\udccf\u2934\u2935\u2190-\u21ff]+$/.test(this._input);
		this._has_error = !is_safe_text;
		return is_safe_text;
	}

	mysql_real_escape_string(str): string {
		if (typeof str != 'string')
			return str;

		return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
			switch (char) {
				case "\0":
					return "\\0";
				case "\x08":
					return "\\b";
				case "\x09":
					return "\\t";
				case "\x1a":
					return "\\z";
				case "\n":
					return "\\n";
				case "\r":
					return "\\r";
				case "\"":
				case "'":
				case "\\":
				case "%":
					return "\\" + char; // prepends a backslash to backslash, percent,
				// and double/single quotes
			}
		});
	}

	matches(test_input: any): boolean {
		let result = test_input === this._input;
		this._has_error = !result;
		return result;
	}

	hasCheckError(): boolean {
		return this._has_check_error;
	}

	hasError(): boolean {
		return this._has_check_error ? true : this._has_error;
	}

	overrideError(): void {
		this._has_check_error = false
		this._has_error = false
	}

	static debug_form_autofill(debug: boolean, input: any) {
		return debug && input ? input : '';
	}

	static input_token_generate() {
		let input_token = create_UUID();
		localStorage.setItem('input_token', input_token);
		return input_token;
	}

	static input_token_is_valid(input_token: string): boolean {
		let result = localStorage.getItem('input_token') === input_token;
		localStorage.removeItem('input_token');
		return result;
	}
}
