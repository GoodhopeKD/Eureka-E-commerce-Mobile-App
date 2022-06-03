import SDateTime from '../auxilliary/SDateTime'

const DiscountInstanceResource = {
    id              : 0,
    code            : '',
    details         : '',
    amount          : 0,
    order_id        : null,
    claimed_datetime   : '',
}

class DiscountInstance {
    id              : number = 0
    code            : string = ''
    details         : string = ''
    amount          : number = 0
    order_id        : number | null = null
    claimed_datetime   : SDateTime

	constructor(resp: typeof DiscountInstanceResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.claimed_datetime = new SDateTime(resp.claimed_datetime);
	}
}

export default DiscountInstance;
export { DiscountInstanceResource };
