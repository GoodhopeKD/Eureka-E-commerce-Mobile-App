import { store } from '../../config/redux.config';
import Cart from '../auxilliary/Cart';
import SDateTime from '../auxilliary/SDateTime';
import Review from '../element/Review';
import Phone, { PhoneResource } from '../element/Phone';
import Order, { OrderResource } from '../element/Order';
import Address, { AddressResource } from '../element/Address';
import Admin, { AdminResource } from '../entity/Admin';
import Pin, { PinResource } from '../element/Pin';
import Store, { StoreResource } from '../entity/Store';
import FollowInstance, { FollowInstanceResource } from '../relation/FollowInstance';
import SearchTerm, { SearchTermResource } from '../element/SearchTerm';
import ConnectInstance, { ConnectInstanceResource } from '../element/ConnectInstance';
import Product, { ProductResource } from '../element/Product';
import DiscountInstance, { DiscountInstanceResource } from '../relation/DiscountInstance';
import Image, { ImageResource } from '../element/Image';
import EntityNotification, { EntityNotificationResource } from '../element/EntityNotification';
import EntityPreference from '../element/EntityPreference';
import VisitViewFollowCountResource from '../extra/VisitViewFollowCountResource';
import { pagination_auto_nav, pagination_page_nav, getPaginationEndpoint } from '../../utils/laravel-pagination';

enum gender {
	male = 'male',
	female = 'female'
}

enum account_type {
	normal = 'normal',
	store_owner = 'store_owner'
}

enum account_level {
	normal = 'normal',
	admin = 'admin',
	super_admin = 'super_admin'
}

enum account_status {
	active = 'active',
	suspended = 'suspended',
	deactivated = 'deactivated',
	deleted = 'deleted'
}

enum loadable_attributes {
	connect_instances = "connect_instances",
}

enum related_member_types {
	address = "address",
	phone = "phone",
}

const signin_data = {
	email: '',
	password: '',
}

const signup_data = {
	surname: '',
	name_s: '',
	email: '',
	password: '',
	password_confirmation: '',
}

const UserExtensionResource = {
	connect_instances: [],
}

const UserResource = {
	id: 0,
	email: '',
	email_verified_datetime: null,
	surname: '',
	name_s: '',
	username: null,
	profile_image: ImageResource,
	gender: null,
	phones: [],
	address: AddressResource,
	signup_datetime: '',
	last_active_datetime: '',
	account_type: '',
	account_level: '',
	account_status: '',
	account_verified_datetime: null,
	loyalty_points: 0,
	referral_code: null,
	seller_visits: VisitViewFollowCountResource,
	seller_rating: 0,
	preference_items: [],

	referral_code_use_instances: [],
	admin_extension: null,
	pins: [],
	search_terms: [],
	follow_instances: [],
	notifications: [],
	store_owned: null,
	has_seller_products: false,
	seller_reviews: [],

	...UserExtensionResource
}

class User {
	id: number = 0
	email: string = ''
	email_verified_datetime: SDateTime | null = null
	surname: string = ''
	name_s: string = ''
	name: string = ''
	username: string | null = null
	profile_image: Image | null = null
	gender: gender | null = null
	phones: Phone[]
	address: Address | null = null
	signup_datetime: SDateTime
	last_active_datetime: SDateTime
	account_type: account_type = account_type.normal
	account_level: account_level = account_level.normal
	account_status: account_status = account_status.active
	account_verified_datetime: SDateTime | null = null
	loyalty_points: number = 0
	referral_code: string | null = null
	seller_visits: typeof VisitViewFollowCountResource | null = null
	seller_rating: number = 0
	preference_items: EntityPreference[]
	preferences: any

	connect_instances: ConnectInstance[]
	cart: Cart
	pinned_favourite_products: Pin[]
	pinned_events: Pin[]
	search_terms: SearchTerm[]
	referral_code_use_instances: DiscountInstance[]
	follow_instances: FollowInstance[]
	notifications: EntityNotification[]

	admin_extension: Admin | null
	is_active_admin: boolean = false

	store_owned: Store | null
	owns_store: boolean = false

	has_seller_products: boolean = false

	seller_reviews: Review[]

	DB_extension_resource: {}

	constructor(resp: typeof UserResource, loader = []) {
		// Clear empty values and arrays and Load Inline
		resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
		Object.assign(this, resp);

		this.connect_instances = []
		this.cart = new Cart([])
		this.pinned_favourite_products = [];
		this.pinned_events = [];
		this.search_terms = [];
		this.referral_code_use_instances = [];
		this.follow_instances = [];
		this.notifications = [];
		this.admin_extension = null
		this.store_owned = null
		this.seller_reviews = []
		this.name = this.name_s + ' ' + this.surname;
		this.phones = [];
		this.preferences = {};

		// Load arrays
		if (loader.includes('phones') && resp.phones && resp.phones.length) {
			resp.phones.forEach((element: typeof PhoneResource) => {
				this.phones.push(new Phone(element));
			});
		}

		if (loader.includes('preferences') && resp.preference_items && resp.preference_items.length) {
			for (var i = 0; i < resp.preference_items.length; i++) {
				this.preference_items.push(new EntityPreference(resp.preference_items[i]));
				this.preferences[resp.preference_items[i].key] = resp.preference_items[i].value;
			}
		}

		// Load Special Classes
		this.address =
			loader.includes('address') && resp.address !== null && typeof resp.address === typeof AddressResource ? new Address(resp.address) : null;

		this.profile_image =
			loader.includes('profile_image') && resp.profile_image !== null && typeof resp.profile_image === typeof ImageResource
				? new Image(resp.profile_image)
				: null;

		// Load Datetimes
		this.email_verified_datetime =
			loader.includes('email_verified_datetime') && typeof resp.email_verified_datetime === 'string' ? new SDateTime(resp.email_verified_datetime) : null;
		this.signup_datetime = new SDateTime(resp.signup_datetime);
		this.last_active_datetime = new SDateTime(resp.last_active_datetime);

		if (loader.includes('all_pins') || loader.includes('cart') || loader.includes('pinned_favourite_products') || loader.includes('pinned_events')) {
			let cart_entries: typeof PinResource[] = [];
			if (resp.pins && resp.pins.length) {
				resp.pins.forEach((element: typeof PinResource) => {
					if (element.item_table === 'products') {
						if ((loader.includes('all_pins') || loader.includes('pinned_favourite_products')) && element.pin_type === 'favourite') this.pinned_favourite_products.push(new Pin(element));
						if ((loader.includes('all_pins') || loader.includes('cart')) && element.pin_type === 'cart') cart_entries.push(element);
					} else if ((loader.includes('all_pins') || loader.includes('pinned_events')) && element.item_table === 'events') {
						this.pinned_events.push(new Pin(element));
					}
				});
			}
			if (cart_entries.length) this.cart = new Cart(cart_entries);
		}

		if (loader.includes('search_terms') && resp.search_terms && resp.search_terms.length) {
			resp.search_terms.forEach((element: typeof SearchTermResource) => {
				this.search_terms.push(new SearchTerm(element));
			});
		}

		if (loader.includes('referral_code_use_instances') && resp.referral_code_use_instances && resp.referral_code_use_instances.length) {
			resp.referral_code_use_instances.forEach((element: typeof DiscountInstanceResource) => {
				this.referral_code_use_instances.push(new DiscountInstance(element));
			});
		}

		if (loader.includes('follow_instances') && resp.follow_instances && resp.follow_instances.length) {
			resp.follow_instances.forEach((element: typeof FollowInstanceResource) => {
				this.follow_instances.push(new FollowInstance(element));
			});
		}

		if (loader.includes('notifications') && resp.notifications && resp.notifications.length) {
			resp.notifications.forEach((element: typeof EntityNotificationResource) => {
				this.notifications.push(new EntityNotification(element));
			});
		}

		this.is_active_admin = resp.admin_extension !== null && typeof resp.admin_extension === typeof AdminResource

		this.admin_extension =
			loader.includes('admin_extension') && this.is_active_admin
				? new Admin(resp.admin_extension)
				: null;

		this.owns_store = resp.store_owned !== null && typeof resp.store_owned === typeof StoreResource

		this.store_owned =
			loader.includes('store_owned') && this.owns_store
				? new Store(resp.store_owned)
				: null;
	}

	static async signUp(data: typeof signup_data) {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: 'users/signup',
				data
			})
			.then((response: any) => {
				return Promise.resolve(response.user)
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	static async signIn(data: typeof signin_data) {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: 'users/signin',
				data
			})
			.then((response: any) => {
				return Promise.resolve(response.user)
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async signOut() {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: 'users/signout'
			})
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async update(resp: typeof UserResource) {

		let update_object = {};

		if (resp.surname && resp.surname !== this.surname) update_object['surname'] = resp.surname;
		if (resp.name_s && resp.name_s !== this.name_s) update_object['name_s'] = resp.name_s;
		if (resp.username && resp.username !== this.username) update_object['username'] = resp.username;
		if (resp.email && resp.email !== this.email) update_object['email'] = resp.email;

		if (!Object.keys(update_object).length) return Promise.reject({ message: "No values were modified" });

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'PUT',
				endpoint: 'users/{id}',
				data: { ...update_object, id: this.id }
			})
			.then((response: any) => {
				return Promise.resolve(response)
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	static async getAll() {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint: 'users/all'
			})
			.then((response: any) => {
				store.dispatch({ type: 'USERS_SET_RESOURCE_COLLECTION', collection: response });
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	static async search(input: string) {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint: 'core/search/{pool}/{query_string}',
				data: { pool: 'users', query_string: input }
			})
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async mergePins(local_pins) {

		local_pins = local_pins.filter((element: typeof PinResource) => !(element.item.seller_id == this.id && element.item.seller_table == 'users'))

		if (!local_pins.length) return Promise.resolve();

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: 'users/{id}/merge_pins',
				data: { local_pins, id: this.id }
			})
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async extendFromDB(attribute_name: loadable_attributes, pagination: pagination_auto_nav | typeof pagination_page_nav | null = null) {

		let av_attribute_name = ""
		let endpoint = '';
		let data = {}

		if (attribute_name == 'connect_instances') {
			endpoint = 'users/{user_id}/connect_instances'
			data['user_id'] = this.id
			av_attribute_name = attribute_name
		}

		if (endpoint === '') {
			Promise.resolve()
		}

		if (pagination !== null) {
			endpoint = getPaginationEndpoint(endpoint, pagination, 'User');
		}

		return store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint,
				data
			})
			.then((response: any) => {
				this.DB_extension_resource = response
				let resp = UserExtensionResource
				resp[av_attribute_name] = response.data
				store.dispatch({
					type: "SYSTEM_STATUS_SET_EXTENSION_PAGINATION_PARAMS",
					extension_pagination_params: { links: response.links, meta: response.meta }
				})
				this.extend(resp, attribute_name)
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	extend(resp: typeof UserExtensionResource, attribute_name: loadable_attributes) {
		// Clear empty values and arrays
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
		Object.assign(this, resp);
		this.connect_instances = []

		switch (attribute_name) {
			case "connect_instances":
				if (resp.connect_instances && resp.connect_instances.length) {
					resp.connect_instances.forEach((element: typeof ConnectInstanceResource) => {
						this.connect_instances.push(new ConnectInstance(element));
					});
				}
				break;
			default:
				break;

		}
	}

	async addRelatedMember(related_member_type: related_member_types, resp) {
		switch (related_member_type) {
			case 'address':
				return Address.create({
					...resp,
					owner_table: 'users',
					owner_id: this.id
				})

			case 'phone':
				return Phone.create({
					...resp,
					owner_table: 'users',
					owner_id: this.id
				})

			default:
				return Promise.reject({ message: 'Related memeber not recognized' })
		}
	}
}

export { UserResource };
export default User;
