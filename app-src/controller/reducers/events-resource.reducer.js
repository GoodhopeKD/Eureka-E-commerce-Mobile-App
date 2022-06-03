import initial_state from './_resource_initial_state';

const events_resource_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'EVENTS_SET_SELECTED':
			return {
				...state,
				selected: action.selected
			};

		case 'EVENTS_SET_RESOURCE_COLLECTION':
			return {
				...state,
				collection: { links: action.collection.links, meta:action.collection.meta }
			};

		case 'EVENTS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default events_resource_reducer;
