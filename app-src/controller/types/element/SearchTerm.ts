import SDateTime from '../auxilliary/SDateTime';

enum search_pool {
	all = 'all',
	users = 'users',
	products = 'products',
	stores = 'stores',
	events = 'events'
}

const SearchTermResource = {
    id                  : 0,
    query_string        : null,
    pool                : null,
    user_id             : 0,
    connect_instance_id : 0,
    search_datetime     : ''
}

class SearchTerm 
{
    id                  : number = 0
    pool                : search_pool = search_pool.all
    query_string        : string = ''
    user_id             : number = 0
    connect_instance_id : number = 0
    search_datetime     : SDateTime

	constructor(resp: typeof SearchTermResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.search_datetime = new SDateTime(resp.search_datetime);
	}
}

export default SearchTerm;
export { SearchTermResource };
