import { store } from '../../config/redux.config';
import SDateTime from '../auxilliary/SDateTime';
import SEvent, { EventResource } from '../element/Event';
import Product, { ProductResource } from '../element/Product';
//import ProductVariation, { ProductVariationResource } from '../element/ProductVariation';
import { instanceToResource } from '../../utils/globals'
//import { variations_update_object_params } from '../../utils/special-update-object-params';

enum pin_item_table {
	products = 'products',
	events = 'events'
}

enum pin_type {
	favourite = 'favourite',
	cart = 'cart'
}

const PinResource = {
	id: 0,
	item_table: "",
	item_id: 0,
	item: { ...ProductResource, ...EventResource },
	item_cart_count: 1,
	//item_cart_variations: [],
	adder_user_id: 0,
	pin_type: "",
	pin_datetime: '',
}

class Pin {
	id: number = 0
	item_table: pin_item_table = pin_item_table.products
	item_id: number = 0
	item: Product | SEvent | null = null
	item_cart_count: number = 1
	//item_cart_variations: ProductVariation[]
	adder_user_id: number = 0
	pin_type: pin_type = pin_type.cart
	pin_datetime: SDateTime

	constructor(resp: typeof PinResource) {
		// Clear empty values and arrays and Load Inline
		//resp = _.cloneDeep(resp)
		resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
		Object.assign(this, resp);

		if (this.item_table === 'products' && typeof resp.item === typeof ProductResource)
			this.item = new Product(resp.item);
		if (this.item_table === 'events' && typeof resp.item === typeof EventResource)
			this.item = new SEvent(resp.item);

		/*this.item_cart_variations = [];
		if (resp.item_cart_variations && resp.item_cart_variations.length) {
			resp.item_cart_variations.forEach((element: typeof ProductVariationResource) => {
				this.item_cart_variations.push(new ProductVariation(element));
			});
		}*/

		this.pin_datetime = new SDateTime(resp.pin_datetime);
	}

	async update(resp: typeof PinResource, /*variations_update_object : typeof variations_update_object_params | null = null*/) {

		let should_update = false
		let update_object = {};

		if (resp.item_cart_count && resp.item_cart_count !== this.item_cart_count) update_object['item_cart_count'] = resp.item_cart_count;
		if (resp.pin_type && resp.pin_type !== this.pin_type) update_object['pin_type'] = resp.pin_type;

		//should_update = variations_update_object && variations_update_object.new_variations_to_save && variations_update_object.new_variations_to_save.length ? true : should_update
		//should_update = variations_update_object && variations_update_object.old_variations_to_delete_forever && variations_update_object.old_variations_to_delete_forever.length ? true : should_update

		should_update = Object.keys(update_object).length ? true : should_update

		if (!should_update) return Promise.reject({ message: "No values were modified" });

		let auth_user_data: any = store.getState().auth_user_data;
		if (auth_user_data) {
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'PUT',
					endpoint: 'users/{adder_user_id}/pins/{id}',
					data: { ...update_object, /*...variations_update_object,*/ id: this.id, adder_user_id: this.adder_user_id }
				})
				.then((response: any) => {
					return Promise.resolve(response);
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});
		} else {
			resp = { ...instanceToResource(this), ...update_object, /*...variations_update_object,*/ };
			store.dispatch({ type: 'LOCAL_PINS_EDIT_ONE', pin: resp });
			return Promise.resolve();
		}
	}

	static async create(resp: typeof PinResource) {
		let auth_user_data: any = store.getState().auth_user_data;
		if (auth_user_data) {
			const data = {
				item_id: resp.item_id,
				item_table: resp.item_table,
				item_cart_count: resp.item_table == "products" ? (resp.item_cart_count ? resp.item_cart_count : 1) : null,
				pin_type: resp.pin_type,
				adder_user_id: auth_user_data.id,
			}
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'POST',
					endpoint: 'users/{adder_user_id}/pins',
					data
				})
				.then((response: any) => {
					return Promise.resolve(response.pin);
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});
		} else {
			store.dispatch({ type: 'LOCAL_PINS_ADD_ONE', pin: resp });
			return Promise.resolve();
		}
	}

	async delete() {
		let auth_user_data: any = store.getState().auth_user_data;
		if (auth_user_data) {
			const data = {
				id: this.id,
				adder_user_id: auth_user_data.id,
			}
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'DELETE',
					endpoint: 'users/{adder_user_id}/pins/{id}',
					data
				})
				.then((response: any) => {
					store.dispatch({ type: 'PRODUCTS_SET_CART_SELECTED', cart_pinned_resource: response });
					return Promise.resolve(response);
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});
		} else {
			store.dispatch({ type: 'LOCAL_PINS_REMOVE_ONE', pin: this });
			return Promise.resolve();
		}
	}
}

export default Pin;
export { PinResource };
