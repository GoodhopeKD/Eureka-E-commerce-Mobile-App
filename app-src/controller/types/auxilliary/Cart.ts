import SDateTime from '../auxilliary/SDateTime';
import { ProductResource } from '../element/Product';
import Pin, { PinResource } from '../element/Pin';

export default class Cart {
	pins: Pin[] = [];
	created_datetime: SDateTime | null = null;
	last_item_added_datetime: SDateTime | null = null;
	total_price: number = 0;

	constructor(pinned_products: typeof PinResource[]) {
		//this.pins = pinned_products
		if (pinned_products.length) {
			pinned_products.sort((a, b) => (a.pin_datetime + '').localeCompare(b.pin_datetime + ''));

			this.created_datetime = new SDateTime(pinned_products[0].pin_datetime);
			this.last_item_added_datetime = new SDateTime(pinned_products[pinned_products.length - 1].pin_datetime);
		}

		pinned_products.forEach((element) => {
			if (typeof element === typeof ProductResource)
				this.total_price += +element.item.price * element.item_cart_count;
			this.pins.push(new Pin(element));
		});
	}
}
