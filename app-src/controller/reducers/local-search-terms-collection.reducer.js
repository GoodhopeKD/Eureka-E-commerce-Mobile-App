const initial_state = {
	data: []
};

const local_search_terms_collection_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'LOCAL_SEARCH_ITEMS_ADD_ONE':
			return {
				...state,
				data: [
					...state.data.filter((pin) => pin.item.id !== action.pin.item.id),
					{ ...action.pin, id: Math.max(...state.data.map((o) => o.id), 0) + 1 }
				]
			};

		case 'LOCAL_SEARCH_ITEMS_REMOVE_ONE':
			return { ...state, data: state.data.filter((pin) => pin.item.id !== action.item.id) };

		case 'LOCAL_SEARCH_ITEMS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default local_search_terms_collection_reducer;
