import SDateTime from '../auxilliary/SDateTime'

enum product_category_entries_type {
	product = 'product',
	service = 'service',
	product_and_or_service = 'product_and_or_service',
}

const ProductCategoryResource = {
    id                  : 0,
    name                : '',
    keywords            : '',
    entries_type        : '',
    adder_user_id       : null,
    added_datetime      : '',
}

class ProductCategory {
    id                  : number = 0
    name                : string = ''
    keywords            : string = ''
    entries_type        : product_category_entries_type.product_and_or_service
    adder_user_id       : number | null = null
    added_datetime      : SDateTime

	constructor(resp: typeof ProductCategoryResource) {
        // Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.added_datetime = new SDateTime(resp.added_datetime);
	}
}

export default ProductCategory;
export { ProductCategoryResource };