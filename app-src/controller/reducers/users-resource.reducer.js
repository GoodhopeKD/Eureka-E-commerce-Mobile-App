import initial_state from './_resource_initial_state';

const users_resource_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'USERS_SET_SELECTED':
			return {
				...state,
				selected: action.selected
			};

		case 'USERS_SET_RESOURCE_COLLECTION':
			return {
				...state,
				collection: { links: action.collection.links, meta: action.collection.meta }
			};

		case 'USERS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default users_resource_reducer;
