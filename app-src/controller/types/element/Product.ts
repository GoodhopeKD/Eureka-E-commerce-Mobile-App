import { store } from '../../config/redux.config';
import SDateTime from '../auxilliary/SDateTime';
import Image, { ImageResource } from '../element/Image';
import ProductCategory, { ProductCategoryResource } from '../element/ProductCategory';
//import ProductVariation, { ProductVariationResource } from '../element/ProductVariation';
import Review, { ReviewResource } from '../element/Review';
import EntityDisplayCardResource from '../extra/EntityDisplayCardResource';
import VisitViewFollowCountResource from '../extra/VisitViewFollowCountResource';
import { images_update_object_params, /*variations_update_object_params*/ } from '../../utils/special-update-object-params';
import { pagination_auto_nav, pagination_page_nav, getPaginationEndpoint } from '../../utils/laravel-pagination';


function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

enum product_seller_table {
	users = 'users',
	stores = 'stores'
}

enum product_entry_type {
	product_and_or_service = 'product_and_or_service',
	product = 'product',
	service = 'service'
}

enum ProductStatus {
	pending_confirmation = 'pending_confirmation',
	available = 'available',
	unavailable = 'unavailable',
	suspended = 'suspended'
}

const find_params = {
	id: 0,
	reference: '',
}

const get_all_params = {
	indexer: '',
	seller_table: '',
	seller_id: '',
	query_string: '',
	location_name: ''
}

const ProductResource = {
	id: 0,
	reference: '',
	name: '',
	price: 0,
	details: '',
	commune: '',
	wilaya: '',
	stock_available: '',
	category_id: null,
	category: ProductCategoryResource,
	//variations: [],
	entry_type: '',
	seller_table: '',
	seller_id: null,
	seller: EntityDisplayCardResource,
	is_seller_pinned: false,
	added_datetime: '',
	adder_user_id: null,
	adder: EntityDisplayCardResource,
	updated_datetime: '',
	condition: '',
	status: '',
	confirmation_datetime: '',
	intermediary_admin_user_id: null, 
	intermediary_admin: EntityDisplayCardResource,
	images: [],
	views: VisitViewFollowCountResource,
	reviews: [],
	rating: 0,
	related_products: [],
	added_by_auth_user: false,
	pinning: {
		cart: null,
		favourite: null,
		order: null,
	}
}

class Product {
	id: number = 0
	reference: string = ''
	name: string = ''
	price: number = 0
	details: string = ''
	entry_type: product_entry_type = product_entry_type.product
	commune: string = ''
	wilaya: string = ''
	stock_available: number | null = null
	category_id: number | null = null
	category: ProductCategory | null = null
	//variations: ProductVariation[]
	seller_table: product_seller_table = product_seller_table.users
	seller_id: number = 0
	seller: typeof EntityDisplayCardResource | null = null
	is_seller_pinned: boolean = false
	added_datetime: SDateTime
	adder_user_id: number | null = null
	adder: typeof EntityDisplayCardResource | null = null
	updated_datetime: SDateTime
	condition: string = ''
	status: ProductStatus = ProductStatus.pending_confirmation
	confirmation_datetime: SDateTime | null
	intermediary_admin_user_id: number | null = null
	intermediary_admin: typeof EntityDisplayCardResource | null = null
	images: Image[]
	views: typeof VisitViewFollowCountResource = VisitViewFollowCountResource
	reviews: Review[]
	rating: number = 0
	related_products: [] = []
	added_by_auth_user: boolean = false
	pinning: {
		cart: boolean,
		favourite: boolean,
		order: boolean,
	}

	constructor(resp: typeof ProductResource) {
		this.populate(resp)
	}

	populate(resp: typeof ProductResource) {
		// Clear empty values and arrays and Load Inline
		resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
		Object.assign(this, resp);

		this.images = [];
		this.reviews = [];

		// Load arrays
		if (resp.images && resp.images.length) {
			resp.images.forEach((element: typeof ImageResource) => {
				this.images.push(new Image(element));
			});
		}
		if (resp.reviews && resp.reviews.length) {
			resp.reviews.forEach((element: typeof ReviewResource) => {
				this.reviews.push(new Review(element));
			});
		}
		/*this.variations = [];
		if (resp.variations && resp.variations.length) {
			resp.variations.forEach((element: typeof ProductVariationResource) => {
				this.variations.push(new ProductVariation(element));
			});
		}*/

		this.category = typeof resp.category === typeof ProductCategoryResource ? new ProductCategory(resp.category) : null;

		// Load Datetimes
		this.added_datetime = new SDateTime(resp.added_datetime);
		this.updated_datetime = new SDateTime(resp.updated_datetime);
		this.confirmation_datetime = typeof resp.confirmation_datetime === 'string' ? new SDateTime(resp.confirmation_datetime) : null;

		// check if product is in favourites
		const auth_user_data: any = store.getState().auth_user_data;
		if (!auth_user_data) {
			let pins = store.getState().local_pins_collection.data;
			this.pinning.favourite = pins.some(
				(pin) => pin.item_table === 'products' && pin.pin_type === 'favourite' && pin.item.id === this.id
			);
			this.pinning.cart = pins.some(
				(pin) => pin.item_table === 'products' && pin.pin_type === 'cart' && pin.item.id === this.id
			);
		}
	}

	async read(with_related: boolean = false) {
		if (this.reference)
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'GET',
					endpoint: 'products/{reference}' + (with_related ? '/with_related' : ''),
					data: { reference: this.reference }
				})
				.then((response: any) => {
					this.populate(response)
					return Promise.resolve();
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});
		return Promise.reject({ message: "Product reference not found" });
	}

	static async findOne(params: typeof find_params) {
		const endpoint = params.reference ? 'products/{reference}' : (params.id ? 'products/{id}' : '')
		if (endpoint)
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'GET',
					endpoint,
					data: params
				})
				.then((response: any) => {
					return Promise.resolve(response);
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});
		return Promise.reject({ message: "Input a reference or an id to find product" });
	}

	static async getAll(pagination: pagination_auto_nav | typeof pagination_page_nav | null = null, params: typeof get_all_params | null = null) {

		let endpoint = 'products/all';

		let data = {}

		if (params) {
			if (params.indexer == 'from_seller_available' && ['stores', 'users'].includes(params.seller_table) && params.seller_id) {
				endpoint = params.seller_table + '/{seller_id}/' + ((params.seller_table == 'users') ? 'seller_' : '') + 'products/available'
				data['seller_id'] = params.seller_id
			}
			if (params.indexer == 'from_seller_all' && ['stores', 'users'].includes(params.seller_table) && params.seller_id) {
				endpoint = params.seller_table + '/{seller_id}/' + ((params.seller_table == 'users') ? 'seller_' : '') + 'products/all'
				data['seller_id'] = params.seller_id
			}
			if (params.indexer == 'admin_products_action_list') {
				endpoint = 'admins/products/pending_action'
			}
			if (params.indexer == 'search') {
				endpoint = 'core/search/{pool}/{query_string}'
				data['pool'] = 'products'
				data['query_string'] = params.query_string
			}
			if (params.indexer == 'from_location') {
				endpoint = 'products/from_location/{location_name}'
				data['location_name'] = params.location_name
			}
			if (params.indexer == 'popular') {
				endpoint = 'products/popular'
			}
		}

		if (pagination !== null) {
			endpoint = getPaginationEndpoint(endpoint, pagination, 'products_resource');
		}

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint,
				data
			})
			.then((response: any) => {
				store.dispatch({ type: 'PRODUCTS_SET_RESOURCE_COLLECTION', collection: response });
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	static async create(resp: typeof ProductResource) {

		const endpoint_2 = resp.seller_table + '/' + resp.seller_id + '/' + ((resp.seller_table == 'users') ? 'seller_' : '') + 'products'
		const endpoint_1 = endpoint_2 + '/upload_images'

		const data = new FormData();
		for (let i = 0; i < resp.images.length; i++) {
			data.append("images[]", resp.images[i]);
		}

		const response = await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: endpoint_1,
				data_has_files: true,
				data,
			}).catch((error: any) => {
				return Promise.reject(error);
			});

		for (let i = 0; i < resp.images.length; i++) {
			const new_image = response.images.find(t => t.old_name == resp.images[i].name)
			resp.images[i].name = new_image.name
			resp.images[i].uri = new_image.uri
		}

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: endpoint_2,
				data: resp,
			})
			.then((response: any) => {
				return Promise.resolve(response)
			}).catch((error: any) => {
				return Promise.reject(error);
			});
	}


	async update(
		resp: typeof ProductResource,
		images_update_object: typeof images_update_object_params | null = null,
		//variations_update_object : typeof variations_update_object_params | null = null
	) {

		let should_update = false
		let update_object = {};

		if (resp.name && resp.name !== this.name) update_object['name'] = resp.name;
		if (resp.category_id && resp.category_id !== this.category_id) update_object['category_id'] = resp.category_id;
		if (resp.details && resp.details !== this.details) update_object['details'] = resp.details;
		if (resp.entry_type && resp.entry_type !== this.entry_type) update_object['entry_type'] = resp.entry_type;
		if (resp.price && resp.price != this.price) update_object['price'] = resp.price;
		if (resp.condition && resp.condition !== this.condition) update_object['condition'] = resp.condition;
		if (resp.commune && resp.commune !== this.commune) update_object['commune'] = resp.commune;
		if (resp.wilaya && resp.wilaya !== this.wilaya) update_object['wilaya'] = resp.wilaya;
		if (resp.status && resp.status !== this.status) update_object['status'] = resp.status;

		//should_update = variations_update_object && variations_update_object.new_variations_to_save && variations_update_object.new_variations_to_save.length ? true : should_update
		//should_update = variations_update_object && variations_update_object.old_variations_to_delete_forever && variations_update_object.old_variations_to_delete_forever.length ? true : should_update

		should_update = images_update_object && images_update_object.new_images_to_upload && images_update_object.new_images_to_upload.length ? true : should_update
		should_update = images_update_object && images_update_object.old_images_to_delete_from_storage && images_update_object.old_images_to_delete_from_storage.length ? true : should_update
		should_update = images_update_object && images_update_object.images_to_refresh_in_db && images_update_object.images_to_refresh_in_db.length && !arraysEqual(images_update_object.images_to_refresh_in_db, this.images) ? true : should_update

		should_update = Object.keys(update_object).length ? true : should_update

		if (!should_update) return Promise.reject({ message: "No values were modified" });

		update_object['images'] = resp.images

		if (this.status == 'available' && !(resp.status && ['suspended', 'unavailable'].includes(resp.status)))
			update_object['status'] = 'pending_confirmation'

		const endpoint_2 = this.seller_table + '/' + this.seller_id + '/' + ((this.seller_table == 'users') ? 'seller_' : '') + 'products/{id}'
		const endpoint_1 = endpoint_2.replace('/{id}', '') + '/upload_images'

		if (images_update_object && images_update_object.new_images_to_upload && images_update_object.new_images_to_upload.length) {

			const data = new FormData();
			for (let i = 0; i < images_update_object.new_images_to_upload.length; i++) {
				data.append("images[]", images_update_object.new_images_to_upload[i]);
			}

			const response = await store
				.dispatch({
					type: 'API_CALL',
					method: 'POST',
					endpoint: endpoint_1,
					data_has_files: true,
					data,
				}).catch((error: any) => {
					return Promise.reject(error);
				});

			for (let i = 0; i < update_object['images'].length; i++) {
				const new_image = response.images.find(t => t.old_name == update_object['images'][i].name)
				if (new_image) {
					update_object['images'][i].name = new_image.name
					update_object['images'][i].uri = new_image.uri
				}
			}
		}

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'PUT',
				endpoint: endpoint_2,
				data: { ...update_object, ...images_update_object, /*...variations_update_object,*/ id: this.id },
			})
			.then((response: any) => {
				this.populate(response.product)
				return Promise.resolve(response.product)
			}).catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async delete() {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'DELETE',
				endpoint: this.seller_table + '/{seller_id}/' + ((this.seller_table == 'users') ? 'seller_' : '') + 'products/{id}',
				data : { seller_id: this.seller_id, id: this.id }
			})
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});

	}
}

export default Product;
export { ProductResource };
