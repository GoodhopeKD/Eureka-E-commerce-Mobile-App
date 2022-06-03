const initial_state = {
	wilayas: [],
	countries: [],
	product_categories: [],
	permissions: []
};

const datalists_collection_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'DATALISTS_SET_COLLECTION':
			return {
				...state,
				...action.datalists
			};

		case 'LISTS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default datalists_collection_reducer;
