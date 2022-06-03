import SDateTime from '../auxilliary/SDateTime'

enum product_variation_owner_table {
	products = 'products',
	orders = 'orders',
}

const ProductVariationResource = {
    id                  : 0,
    name                : '',
    value               : '',
    price               : null,
    owner_table         : '',
    owner_id            : 0,
    adder_user_id       : null,
    added_datetime      : '',
}

class ProductVariation {
    id                  : number = 0
    name                : string = ''
    value               : string = ''
    price               : number | null = null
    owner_table         : product_variation_owner_table.products
    owner_id            : number = 0
    adder_user_id       : number | null = null
    added_datetime      : SDateTime

	constructor(resp: typeof ProductVariationResource) {
        // Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);

		this.added_datetime = new SDateTime(resp.added_datetime);
	}
}

export default ProductVariation;
export { ProductVariationResource };