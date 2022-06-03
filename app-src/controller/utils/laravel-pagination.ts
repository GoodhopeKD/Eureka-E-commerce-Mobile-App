import { store } from '../config/redux.config';
import { API_URL } from '../config/axios.config';

enum pagination_auto_nav {
	next = 'next',
	prev = 'prev',
	first = 'first',
	last = 'last'
}

const pagination_page_nav = {
	page: 1
};

function getPaginationEndpoint(
	endpoint: string,
	pagination: pagination_auto_nav | typeof pagination_page_nav,
	focus_item: string,
): string {
	const current_elements = (focus_item == 'User') ? store.getState().system_status_data.extension_pagination_params : store.getState()[focus_item].collection;
	if (typeof pagination == 'string') {
		endpoint = current_elements.links[pagination].split(API_URL + '/' + store.getState().active_connect_instance_data.app_access_token + '/')[1];
	}
	if (typeof pagination == typeof pagination_page_nav) {
		endpoint = endpoint + '?page=' + pagination['page'];
	}
	return endpoint;
}

export { pagination_auto_nav, pagination_page_nav, getPaginationEndpoint };
