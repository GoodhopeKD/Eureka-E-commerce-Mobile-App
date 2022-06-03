import SDateTime from '../auxilliary/SDateTime';

const FollowInstanceResource = {
    id                  : 0,
    follower_user_id    : 0,
    followed_store_id   : 0,
    followed_datetime   : '',
}

class FollowInstance {
    id                  : number = 0
    follower_user_id    : number = 0
    followed_store_id   : number = 0
    followed_datetime   : SDateTime

	constructor(resp: typeof FollowInstanceResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.followed_datetime = new SDateTime(resp.followed_datetime);
	}
}

export default FollowInstance;
export { FollowInstanceResource };
