import _initial_state from './_resource_initial_state';

const initial_state = {
	..._initial_state,
	structured_collection: {
		market_square_preview: [],
		recommended: [],
		todays_picks: [],
		popular: []
	},
	cart_pinned_resource: null
};

const products_resource_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'PRODUCTS_SET_SELECTED':
			return {
				...state,
				selected: action.selected
			};

		case 'PRODUCTS_SET_CART_SELECTED':
			return {
				...state,
				cart_pinned_resource: action.cart_pinned_resource
			};

		case 'PRODUCTS_SET_STRUCTURED_COLLECTION':
			return {
				...state,
				structured_collection: { ...state.structured_collection, ...action.structured_collection }
			};

		case 'PRODUCTS_SET_RESOURCE_COLLECTION':
			return {
				...state,
				collection: { links: action.collection.links, meta: action.collection.meta }
			};

		case 'PRODUCTS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default products_resource_reducer;
