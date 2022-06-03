import _resource_initial_state from './_resource_initial_state';

const initial_state = {
	connectivity: null,
	flash : {
		visible : false,
		message : '',
		duration : 1850
	},
	extension_pagination_params : {
		links : _resource_initial_state.links,
		meta: _resource_initial_state.meta
	},
	persistor_purge_state: {
		requested_for_version: 1.0,
		purged_datetime: '2021-08-28 17:49:37'
	}
};

const system_status_data_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'SYSTEM_STATUS_SET_CONNECTIVITY':
			return {
				...state,
				connectivity: action.connectivity
			};

		case 'SYSTEM_STATUS_SET_FLASH_PARAMS':
			return {
				...state,
				flash : { ...state.flash, ...action.flash }
			};

		case 'SYSTEM_STATUS_SET_EXTENSION_PAGINATION_PARAMS':
			return {
				...state,
				extension_pagination_params : action.extension_pagination_params
			};

		case 'SYSTEM_STATUS_SET_PERSISTOR_PURGE_STATE':
			return {
				...state,
				persistor_purge_state : action.persistor_purge_state
			};

		case 'SYSTEM_STATUS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default system_status_data_reducer;
