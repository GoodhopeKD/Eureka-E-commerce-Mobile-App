const initial_state = {
	data: []
};

const local_pins_collection_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'LOCAL_PINS_ADD_ONE':
			return {
				...state,
				data: [
					...state.data.filter((pin) => pin.item.id !== action.pin.item.id),
					{ ...action.pin, id: Math.max(...state.data.map((o) => o.id), 0) + 1 }
				]
			};
		case 'LOCAL_PINS_EDIT_ONE':
			return {
				...state,
				data: [ ...state.data.filter((pin) => pin.id !== action.pin.id), { ...action.pin } ]
			};

		case 'LOCAL_PINS_REMOVE_ONE':
			return { ...state, data: state.data.filter((pin) => pin.id !== action.pin.id) };

		case 'LOCAL_PINS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default local_pins_collection_reducer;
