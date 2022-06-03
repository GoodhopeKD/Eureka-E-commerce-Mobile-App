const auth_user_data_reducer = (state = null, action) => {
	switch (action.type) {
		case 'AUTH_USER_DATA_UPDATE':
			return {
				...state,
				...action.auth_user_data,
			};

		case 'AUTH_USER_DATA_AND_ACTIVE_CONNECT_INSTANCE_DATA_CLEAR_ALL':
			return null;

		default:
			return state;
	}
};

export default auth_user_data_reducer;
