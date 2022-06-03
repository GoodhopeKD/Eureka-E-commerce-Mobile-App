import { batch } from 'react-redux'
/*import { persistor } from '../config/redux.config'
import SDateTime from '../types/auxilliary/SDateTime'*/
import webAPI from '../config/axios.config';

let auth_access_token_returning_endpoints = ['users/signup', 'users/signin'];

let strictly_auth_clear_access_endpoints = [...auth_access_token_returning_endpoints, 'users/request_password_reset'];

let auth_clear_access_endpoints = [
	...strictly_auth_clear_access_endpoints,
	'core/state',
	'core/datalists',
	'core/check/exists/{resource_name}/{test_value}',
	'core/search/{pool}/{query_string}',
	'events/all',
	'events/{reference}',
	'products/all',
	'products/popular',
	'products/structured_collection',
	'products/{reference}',
	'products/{reference}/with_related',
	'products/category/{category_id}',
	'products/from_location/{location_name}',
	'stores/all',
	'stores/{username}',
	'stores/{seller_id}/products/available',
	'users/all',
	'users/{username}',
	'users/{seller_id}/seller_products/available',
	'log_items'
];

// Cleared for get only
let cross_protected = [];

let accepted_methods = ['GET', 'POST', 'PUT', 'DELETE'];

export const web_API_call_middleware = (store) => (next) => (action) => {
	if (action.type === 'API_CALL_MULTIPLE' && action.requests) {
		if (!action.is_boot) {
			let core_state_request_action = {
				method: 'POST',
				endpoint: 'core/state'
			};
			action.requests.push(core_state_request_action);
		}

		const tasks = action.requests.map((request) => {
			request.type = 'API_CALL';
			return store.dispatch(request);
		});

		return allSettled(tasks);
	}

	if (action.type === 'API_CALL' && accepted_methods.includes(action.method)) {
		let active_connect_instance_data = store.getState().active_connect_instance_data;

		if (
			strictly_auth_clear_access_endpoints.includes(action.endpoint) &&
			active_connect_instance_data.auth_access_token !== null
		) {
			return Promise.reject({
				failed: true,
				message: "Action can't be performed with while logged in",
				endpoint
			});
		}

		// For protected endpoints, connect_instance should exist
		const endpoint_without_pagination = action.endpoint.split('?page=')[0]
		if (
			(!auth_clear_access_endpoints.includes(endpoint_without_pagination) ||
				(auth_clear_access_endpoints.includes(endpoint_without_pagination) &&
					cross_protected.includes(endpoint_without_pagination) &&
					action.method !== 'GET')) &&
			active_connect_instance_data.auth_access_token === null
		) {
			return Promise.reject({
				failed: true,
				message: "Action can't be performed with while logged out",
				endpoint: action.endpoint,
			});
		}

		// Use authorization if its there
		if (active_connect_instance_data.auth_access_token) {
			webAPI.defaults.headers.common['Authorization'] = `Bearer ${active_connect_instance_data.auth_access_token}`;
		} else {
			delete webAPI.defaults.headers.common['Authorization'];
		}

		// Rewrite endpoint containing parameter(s)
		var reParamFinder = /\{(.*?)\}/g;
		var params = [];
		var found;
		while ((found = reParamFinder.exec(action.endpoint))) {
			params.push(found[1]);
		}

		if (params.length) {
			params.forEach((element) => {
				action.endpoint = action.endpoint.replace('{' + element + '}', action.data[element]);
				if (!(action.data_to_preserve && action.data_to_preserve.length && action.data_to_preserve.includes(element)))
					delete action.data[element];
			});
		}

		let connect_instance = {
			id: active_connect_instance_data.id, // We know what to update or whether to create a new one
			device_info: active_connect_instance_data.device_info,
			agent_app_info: active_connect_instance_data.agent_app_info,
			utc_offset: active_connect_instance_data.utc_offset,
		};

		let endpoint = action.endpoint;
		if (action.endpoint !== 'core/state')
			action.endpoint = active_connect_instance_data.app_access_token + '/' + action.endpoint;

		let request_object = {
			method: action.method,
			url: action.endpoint,
		}

		if (action.method !== 'GET')
			request_object.data = action.data_has_files ? action.data : { ...action.data, connect_instance }

		return webAPI(request_object)
			.then((response) => {

				/*if (response.data.purge_params) {
					const new_purge_params = response.data.purge_params
					const old_purge_params = store.getState().system_status_data.persistor_purge_state;
					const old_purge_datetime = new SDateTime(old_purge_params.purged_datetime)
					if (compareVersions(new_purge_params.requested_for_version, '>', old_purge_params.requested_for_version) && old_purge_datetime.isBefore(new_purge_params.requested_datetime)) {
						persistor.purge().then(() => dispatch({ type: 'SYSTEM_STATUS_SET_PERSISTOR_PURGE_STATE', persistor_purge_state: { requested_for_version: new_purge_params.requested_for_version, purged_datetime: (new SDateTime()) + '', } }))
					}
				}*/

				batch(() => {
					if (
						(endpoint === 'core/state' &&
							active_connect_instance_data.auth_access_token &&
							!(response.data.connect_instance && response.data.auth_user)) ||
						(endpoint === 'users/signout' && response.data.auth_user === null)
					) {
						store.dispatch({ type: 'AUTH_USER_DATA_AND_ACTIVE_CONNECT_INSTANCE_DATA_CLEAR_ALL' });
					}

					if (auth_access_token_returning_endpoints.includes(endpoint) && response.data.auth_access_token) {
						store.dispatch({ type: 'SET_AUTH_ACCESS_TOKEN', auth_access_token: response.data.auth_access_token });
					}

					if (response.data.auth_user)
						store.dispatch({ type: 'AUTH_USER_DATA_UPDATE', auth_user_data: response.data.auth_user });

					if (response.data.connect_instance)
						store.dispatch({ type: 'UPDATE_STORED_CONNECT_INSTANCE', active_connect_instance_data: response.data.connect_instance });

					if (response.data.products_structured_collection)
						store.dispatch({ type: 'PRODUCTS_SET_STRUCTURED_COLLECTION', structured_collection: response.data.products_structured_collection });

					if (response.data.datalists_collection)
						store.dispatch({ type: 'DATALISTS_SET_COLLECTION', datalists: response.data.datalists_collection });

					if (response.data.stores_home_list)
						store.dispatch({ type: 'STORES_SET_HOME_COLLECTION', home_list: response.data.stores_home_list });
				})
				return Promise.resolve(response.data);
			})
			.catch((err) => {

				let error = {};
				if (err.response) {
					// client received an error response (5xx, 4xx)
					error = {
						status: err.response.status,
						message: err.response.statusText ? err.response.statusText : err.response.data.message,
						data: err.response.data,
						page: err.response.config.url.replace(active_connect_instance_data.app_access_token + '/', '')
					};
				} else if (err.request) {
					// client never received a response, or request never left
					error = {
						message: err.message,
						request: {
							status: err.request.status,
							_response: err.request._response,
							_url: err.request._url,
						}
					};
				} else {
					error = {
						message: err.message
					};
				}

				return Promise.reject(error);
			});
	}

	return next(action);
};

export const connectivityBoot = () => {
	return (dispatch) => {
		batch(() => {
			dispatch({ type: 'SYSTEM_STATUS_SET_CONNECTIVITY', connectivity: null });
			dispatch({ type: 'API_CALL', method: 'POST', endpoint: 'core/state' })
				.then(() => dispatch({ type: 'SYSTEM_STATUS_SET_CONNECTIVITY', connectivity: true }))
				.catch((error) => {
					dispatch({ type: 'SYSTEM_STATUS_SET_CONNECTIVITY', connectivity: false });
					console.log('Boot failed', error);
					//if (error.status == 422) persistor.purge()
				});
		})
	};
};
