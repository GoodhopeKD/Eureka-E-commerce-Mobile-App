import Permission, { PermissionResource } from '../element/Permission';
import SDateTime from '../auxilliary/SDateTime';

enum permission_status {
	active = 'active',
	revoked = 'revoked'
}

const PermissionInstanceResource = {
    id                  : 0,
    permission_id       : 0,
    permission          : PermissionResource,
    admin_id            : 0,
    granter_admin_user_id    : null,
    granted_datetime    : '',
    status              : ''
}

class PermissionInstance {
    id                  : number = 0
    permission_id       : number = 0
    permission          : Permission
    admin_id            : number = 0
    granter_admin_user_id    : number | null = null
    granted_datetime    : SDateTime
    status              : permission_status = permission_status.active

	constructor(resp: typeof PermissionInstanceResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.permission = new Permission(resp.permission);
		this.granted_datetime = new SDateTime(resp.granted_datetime);
	}
}

export default PermissionInstance;
export { PermissionInstanceResource };
