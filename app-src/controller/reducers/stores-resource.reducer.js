import _initial_state from './_resource_initial_state';

const initial_state = {
	..._initial_state,
	home_list: []
};

const stores_resource_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'STORES_SET_SELECTED':
			return {
				...state,
				selected: action.selected
			};

		case 'STORES_SET_RESOURCE_COLLECTION':
			return {
				...state,
				collection: { links: action.collection.links, meta: action.collection.meta }
			};

		case 'STORES_SET_HOME_COLLECTION':
			return {
				...state,
				home_list: action.home_list
			};

		case 'STORES_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default stores_resource_reducer;
