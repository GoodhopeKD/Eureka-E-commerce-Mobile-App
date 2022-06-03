import { store } from '../../config/redux.config';
import SDateTime from '../auxilliary/SDateTime';
import Review, { ReviewResource } from '../element/Review';
import Phone, { PhoneResource } from '../element/Phone';
import Order, { OrderResource } from '../element/Order';
import SocialLink, { SocialLinkResource } from '../element/SocialLink';
import Product, { ProductResource } from '../element/Product';
import Image, { ImageResource } from '../element/Image';
import EntityNotification, { EntityNotificationResource } from '../element/EntityNotification';
import EntityDisplayCardResource from '../extra/EntityDisplayCardResource';
import VisitViewFollowCountResource from '../extra/VisitViewFollowCountResource';

import { pagination_auto_nav, pagination_page_nav, getPaginationEndpoint } from '../../utils/laravel-pagination';
import EntityPreference from '../element/EntityPreference';

enum store_status {
	active = 'active',
	suspended = 'suspended',
	deactivated = 'deactivated',
	deleted = 'deleted'
}

const StoreExtensionResource = {
    products      : [],
    orders        : [],
    notifications : [],
}

const StoreResource = {
    id              : 0,
    name            : '',
    username        : null,
    profile_image   : ImageResource,
    banner_image    : ImageResource,
    status          : '',
    description     : '',
    wilaya          : '',
    commune         : '',
    phones          : [],
    owner_user_id   : null,
    owner           : EntityDisplayCardResource,
    created_datetime : '',
    followers       : VisitViewFollowCountResource,
    visits          : VisitViewFollowCountResource,
    reviews         : [ReviewResource],
    social_links    : [],
	preference_items: [],
	...StoreExtensionResource,
}

class Store
{
    id              : number = 0
    name            : string = ''
    username        : string | null = null
    profile_image   : Image | null = null
    banner_image    : Image | null = null
    status          : store_status = store_status.active
    description     : string = ''
    wilaya          : string = ''
    commune         : string = ''
    phones          : Phone[]
    creator_id      : number | null = null
    created_datetime : SDateTime
    followers       : typeof VisitViewFollowCountResource | null = null
    visits          : typeof VisitViewFollowCountResource | null = null
    reviews         : Review[]
    rating          : number = 0
    social_links    : SocialLink[]
	preference_items: EntityPreference[]
	preferences: any

    products        : Product[]
    orders          : Order[]
    notifications   : EntityNotification[]

	constructor(resp: typeof StoreResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
		
		this.created_datetime = new SDateTime(resp.created_datetime);
		this.banner_image = typeof resp.banner_image === typeof ImageResource ? new Image(resp.banner_image) : null;

		this.products = [];
		this.orders = [];
		this.notifications = [];
		this.preferences = {};

		if (resp.preference_items && resp.preference_items.length) {
			for (var i = 0; i < resp.preference_items.length; i++) {
				this.preference_items.push(new EntityPreference(resp.preference_items[i]));
				this.preferences[resp.preference_items[i].key] = resp.preference_items[i].value;
			}
		}

		// Load arrays
		this.reviews = [];
		if (resp.reviews && resp.reviews.length !== 0) {
			resp.reviews.forEach((element: typeof ReviewResource) => {
				this.reviews.push(new Review(element));
			});
		}

		this.social_links = [];
		if (resp.social_links && resp.social_links.length !== 0) {
			resp.social_links.forEach((element: typeof SocialLinkResource) => {
				this.social_links.push(new SocialLink(element));
			});
		}

		this.phones = [];
		if (resp.phones && resp.phones.length !== 0) {
			resp.phones.forEach((element: typeof PhoneResource) => {
				this.phones.push(new Phone(element));
			});
		}
	}

	extend(resp: typeof StoreExtensionResource) {
		

		if (resp.products && resp.products.length !== 0) {
			resp.products.forEach((element: typeof ProductResource) => {
				this.products.push(new Product(element));
			});
		}

		if (resp.orders && resp.orders.length !== 0) {
			resp.orders.forEach((element: typeof OrderResource) => {
				this.orders.push(new Order(element));
			});
		}

		if (resp.notifications && resp.notifications.length !== 0) {
			resp.notifications.forEach((element: typeof EntityNotificationResource) => {
				this.notifications.push(new EntityNotification(element));
			});
		}
	}

	static async getAll(pagination: pagination_auto_nav | typeof pagination_page_nav | null = null) {
		let endpoint = 'stores/all';

		if (pagination !== null) {
			endpoint = getPaginationEndpoint(endpoint, pagination, 'stores');
		}

		return store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint
			})
			.then((response: any) => {
				store.dispatch({ type: 'STORES_SET_RESOURCE_COLLECTION', collection: response });
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async read() {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint: 'stores/{username}',
				data: { username: this.username }
			})
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}
}

export default Store;
export { StoreResource };
