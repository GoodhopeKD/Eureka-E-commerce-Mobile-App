import SDateTime from '../auxilliary/SDateTime';

enum reviewed_thing_table{
	users = 'users',
	stores = 'stores',
	products = 'products',
	events = 'events'
}

const ReviewResource = {
    id                  : 0,
    rating              : 0,
    comment             : null,
    reviewer_user_id    : null,
    reviewed_thing_table: '',
    reviewed_thing_id   : 0,
    review_datetime     : '',
}

class Review {
    id                  : number = 0
    comment             : string | null = null
    rating              : number = 0
    reviewer_user_id    : number | null = null
    reviewed_thing_table: reviewed_thing_table= reviewed_thing_table.products
    reviewed_entity_id  : number = 0
    review_datetime     : SDateTime

	constructor(resp: typeof ReviewResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.review_datetime = new SDateTime(resp.review_datetime);
	}
}

export default Review;
export { ReviewResource };
