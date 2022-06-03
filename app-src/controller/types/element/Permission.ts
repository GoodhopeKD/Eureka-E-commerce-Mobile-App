import SDateTime from '../auxilliary/SDateTime'

const PermissionResource = {
    id              : 0,
    name            : '',
    description     : '',
    creator_admin_user_id : null,
    created_datetime: '',
}

class Permission 
{
    id                  : number = 0
    name                : string = ''
    description         : string = ''
    creator_admin_user_id : number | null = null
    created_datetime    : SDateTime
    
	constructor(resp: typeof PermissionResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.created_datetime = new SDateTime(resp.created_datetime);
	}
}

export default Permission;
export { PermissionResource };