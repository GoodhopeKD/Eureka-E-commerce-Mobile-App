import initial_state from './_resource_initial_state';

const orders_resource_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'ORDERS_SET_FOCUSED':
			return {
				...state,
				focused: action.focused
			};

		case 'ORDERS_SET_RESOURCE_COLLECTION':
			return {
				...state,
				collection: { links: action.collection.links, meta: action.collection.meta }
			};

		case 'ORDERS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default orders_resource_reducer;
