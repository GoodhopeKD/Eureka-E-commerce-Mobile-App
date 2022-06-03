import { store } from '../../config/redux.config';
import SDateTime from '../auxilliary/SDateTime';
import Image, { ImageResource } from '../element/Image';
import Address, { AddressResource } from '../element/Address';
import Phone, { PhoneResource } from '../element/Phone';
import Product, { ProductResource } from '../element/Product';
//import ProductVariation, { ProductVariationResource } from '../element/ProductVariation';
import DiscountInstance, { DiscountInstanceResource } from '../relation/DiscountInstance';
import { instanceToResource } from '../../utils/globals'
import { images_update_object_params, /*variations_update_object_params*/ } from '../../utils/special-update-object-params';
import { pagination_auto_nav, pagination_page_nav, getPaginationEndpoint } from '../../utils/laravel-pagination';
import EntityDisplayCardResource from '../extra/EntityDisplayCardResource';

enum payment_method {
	cash = 'cash',
	post_cheque = 'post_cheque',
	post_transfer = 'post_transfer',
}

enum order_status {
	placed = 'placed',
	delivery_fee_set = 'delivery_fee_set',
	payment_made = 'payment_made',
	payment_confirmed = 'payment_confirmed',
	delivered = 'delivered',
	completed = 'completed',
	cancelled = 'cancelled'
}

enum product_seller_table {
	users = 'users',
	stores = 'stores'
}

const get_all_params = {
	indexer: '',
	seller_table: '',
	seller_id: null,
	placer_user_id: null
}

const find_params = {
	id: 0,
	reference: '',
}

const OrderResource = {
	id: 0,
	reference: '',
	placer_user_id: null,
	placer: EntityDisplayCardResource,
	placed_datetime: '',
	seller_table: '',
	seller_id: null,
	product_id: null,
	product: ProductResource,
	product_count: 0,
	//product_variations: [],
	delivery_fee: 0,
	delivery_fee_set_datetime: '',
	estimated_delivery_datetime: '',
	amount_due_provisional: 0,
	discount_code: null,
	discount_amount: null,
	discount_instance: DiscountInstanceResource,
	amount_due_final: 0,
	payment_method: '',
	post_payment_receipt: ImageResource,
	payment_made_datetime: null,
	payment_confirmation_datetime: null,
	intermediary_admin_user_id: null,
	status: '',
	delivery_address: AddressResource,
	delivery_phone: PhoneResource,
	completed_datetime: null,
	visible_to_seller: true,
	visible_to_placer: true,
	visible_to_admin: true,
}

class Order {
	id: number = 0
	reference: string = ''
	placer_user_id: number | null = null
	placer: typeof EntityDisplayCardResource | null = null
	placed_datetime: SDateTime
	seller_table: product_seller_table = product_seller_table.users
	seller_id: number = 0
	product_id: number | null = null
	product: Product | null = null
	product_count: number = 0
	//product_variations: ProductVariation[] = []
	delivery_fee: number = 0
	delivery_fee_set_datetime: SDateTime | null = null
	estimated_delivery_datetime: SDateTime | null = null
	amount_due_provisional: number = 0
	discount_code: string | null = null
	discount_amount: number | null = null
	discount_instance: DiscountInstance | null = null
	amount_due_final: number = 0
	payment_method: payment_method = payment_method.cash
	post_payment_receipt: Image | null = null
	payment_made_datetime: SDateTime | null
	payment_confirmation_datetime: SDateTime | null
	intermediary_admin_user_id: number | null = null
	status: order_status = order_status.placed
	progress: number = 0
	delivery_address: Address | null = null
	delivery_phone: Phone | null = null
	completed_datetime: SDateTime | null
	visible_to_seller: boolean = true
	visible_to_placer: boolean = true
	visible_to_admin: boolean = true

	constructor(resp: typeof OrderResource) {
		this.populate(resp)
	}

	populate(resp: typeof OrderResource) {
		// Clear empty values and arrays and Load Inline
		resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
		Object.assign(this, resp);

		if (this.payment_method == 'cash') {
			switch (this.status) {
				case 'placed': this.progress = 0.25; break;
				case 'delivery_fee_set': this.progress = 0.5; break;
				case 'delivered': this.progress = 0.75; break;
				case 'completed': this.progress = 1; break;
				default: break;
			}
		} else {
			switch (this.status) {
				case 'placed': this.progress = 0.17; break;
				case 'delivery_fee_set': this.progress = 0.34; break;
				case 'payment_made': this.progress = 0.51; break;
				case 'payment_confirmed': this.progress = 0.68; break;
				case 'delivered': this.progress = 0.85; break;
				case 'completed': this.progress = 1; break;
				default: break;
			}
		}

		this.delivery_fee_set_datetime =
			typeof resp.delivery_fee_set_datetime === 'string' ? new SDateTime(resp.delivery_fee_set_datetime) : null;
		this.estimated_delivery_datetime =
			typeof resp.estimated_delivery_datetime === 'string' ? new SDateTime(resp.estimated_delivery_datetime) : null;

		this.product = resp.product !== null ? new Product(resp.product) : null;
		this.discount_instance = resp.discount_instance !== null && typeof resp.discount_instance === typeof DiscountInstanceResource
			? new DiscountInstance(resp.discount_instance)
			: null;
		this.post_payment_receipt = resp.post_payment_receipt !== null && typeof resp.post_payment_receipt === typeof ImageResource
			? new Image(resp.post_payment_receipt)
			: null;
		this.delivery_address = resp.delivery_address !== null && typeof resp.delivery_address === typeof ImageResource
			? new Address(resp.delivery_address)
			: null;
		this.delivery_phone = resp.delivery_phone !== null && typeof resp.delivery_phone === typeof ImageResource
			? new Phone(resp.delivery_phone)
			: null;

		/*this.product_variations = [];
		if (resp.product_variations && resp.product_variations.length) {
			resp.product_variations.forEach((element: typeof ProductVariationResource) => {
				this.product_variations.push(new ProductVariation(element));
			});
		}*/

		// Load Datetimes
		this.placed_datetime = new SDateTime(resp.placed_datetime);
		this.payment_made_datetime =
			typeof resp.payment_made_datetime === 'string' ? new SDateTime(resp.payment_made_datetime) : null;
		this.payment_confirmation_datetime =
			typeof resp.payment_confirmation_datetime === 'string'
				? new SDateTime(resp.payment_confirmation_datetime)
				: null;
		this.completed_datetime = typeof resp.completed_datetime === 'string' ? new SDateTime(resp.completed_datetime) : null;
	}

	async read() {
		if (this.reference)
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'GET',
					endpoint: 'orders/{reference}',
					data: { reference: this.reference }
				})
				.then((response: any) => {
					this.populate(response)
					return Promise.resolve();
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});

		return Promise.reject({ message: "Order reference not found" });
	}

	static async findOne(params: typeof find_params) {
		const endpoint = params.reference ? 'orders/{reference}' : (params.id ? 'orders/{id}' : '')
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

		let endpoint = '';
		let data = {}

		if (params) {
			if (params.indexer == 'seller_received_orders' && ['stores', 'users'].includes(params.seller_table) && params.seller_id) {
				endpoint = '{seller_table}/{seller_id}/' + ((params.seller_table == 'users') ? 'seller_received_' : '') + 'orders'
				data['seller_table'] = params.seller_table
				data['seller_id'] = params.seller_id
			}

			if (params.indexer == 'admin_orders_management_list') {
				endpoint = 'admins/orders'
			}

			if (params.indexer == 'user_placed_orders') {
				endpoint = 'users/{placer_user_id}/orders'
				data['placer_user_id'] = params.placer_user_id
			}
		}

		if (pagination !== null) {
			endpoint = getPaginationEndpoint(endpoint, pagination, 'orders_resource');
		}

		if (endpoint == '')
			return Promise.reject({ message: 'Get parameters not set' })

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint,
				data
			})
			.then((response: any) => {
				store.dispatch({ type: 'ORDERS_SET_RESOURCE_COLLECTION', collection: response });
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	static async create(resp: typeof OrderResource, context = 'remote') {
		if (context == 'remote') {
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'POST',
					endpoint: '{seller_table}/{seller_id}/' + ((resp.seller_table == 'users') ? 'seller_received_' : '') + 'orders',
					data: resp
				})
				.then((response: any) => {
					return Promise.resolve(response.order);
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});
		} else {
			store.dispatch({ type: 'ORDERS_SET_FOCUSED', focused: resp });
			return Promise.resolve(resp);
		}
	}

	async update(
		resp: typeof OrderResource,
		images_update_object: typeof images_update_object_params | null = null,
		variations_update_object /*: typeof variations_update_object_params | null */ = null,
		context = 'remote'
	) {

		let should_update = false
		let update_object = {};

		if (resp.payment_method && resp.payment_method !== this.payment_method) update_object['payment_method'] = resp.payment_method;
		if (resp.delivery_fee && resp.delivery_fee !== this.delivery_fee) update_object['delivery_fee'] = resp.delivery_fee;
		if (resp.estimated_delivery_datetime && resp.estimated_delivery_datetime !== this.estimated_delivery_datetime + '') update_object['estimated_delivery_datetime'] = resp.estimated_delivery_datetime;
		if (resp.status && resp.status !== this.status) update_object['status'] = resp.status;
		if (context == 'local') {
			if (resp.delivery_address) update_object['delivery_address'] = resp.delivery_address;
			if (resp.delivery_phone) update_object['delivery_phone'] = resp.delivery_phone;
		}
		if (resp.visible_to_seller !== null && resp.visible_to_seller !== this.visible_to_seller) update_object['visible_to_seller'] = resp.visible_to_seller;
		if (resp.visible_to_placer !== null && resp.visible_to_placer !== this.visible_to_placer) update_object['visible_to_placer'] = resp.visible_to_placer;
		if (resp.visible_to_admin !== null && resp.visible_to_admin !== this.visible_to_admin) update_object['visible_to_admin'] = resp.visible_to_admin;

		//should_update = variations_update_object && variations_update_object.new_variations_to_save && variations_update_object.new_variations_to_save.length ? true : should_update
		//should_update = variations_update_object && variations_update_object.old_variations_to_delete_forever && variations_update_object.old_variations_to_delete_forever.length ? true : should_update

		should_update = images_update_object && images_update_object.new_images_to_upload && images_update_object.new_images_to_upload.length ? true : should_update
		should_update = images_update_object && images_update_object.old_images_to_delete_from_storage && images_update_object.old_images_to_delete_from_storage.length ? true : should_update

		should_update = Object.keys(update_object).length ? true : should_update

		if (!should_update) return Promise.reject({ message: "No values were modified" });

		if (resp.post_payment_receipt) update_object['images'] = [resp.post_payment_receipt]

		if (context == 'remote') {

			const endpoint_2 = this.seller_table + '/' + this.seller_id + '/' + ((this.seller_table == 'users') ? 'seller_received_' : '') + 'orders/{id}'
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

			if (resp.post_payment_receipt) update_object['post_payment_receipt'] = update_object['images'][0]

			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'PUT',
					endpoint: endpoint_2,
					data: { ...update_object, ...images_update_object, /*...variations_update_object,*/ id: this.id },
				})
				.then((response: any) => {
					this.populate(response.order)
					return Promise.resolve(response.order)
				}).catch((error: any) => {
					return Promise.reject(error);
				});
		} else {
			resp = { ...instanceToResource(this), ...update_object };
			store.dispatch({ type: 'ORDERS_SET_FOCUSED', focused: resp });
			return Promise.resolve();
		}
	}
}

export default Order;
export { OrderResource };
