import EntityDisplayCardResource from '../extra/EntityDisplayCardResource';
import HostResource from '../extra/HostResource';
import SDateTime from '../auxilliary/SDateTime';

enum connect_instance_status {
	empty = 'empty',
	active = 'active',
	ended = 'ended'
}

const ConnectInstanceResource = {
    id                      : 0,
    app_access_token        : '',
    user_id                 : null,
    user                    : EntityDisplayCardResource,
    started_datetime        : '',
    updated_datetime        : '',
    signin_datetime          : null,
    last_active_datetime    : '',
    signout_datetime         : null,
    status                  : '',
    device_info   : HostResource,
    agent_app_info  : HostResource,
    request_location        : null,
    utc_offset     : '',
}

class ConnectInstance {
    id                      : number = 0
    app_access_token        : string = ''
    user_id                 : number | null = null
    user                    : typeof EntityDisplayCardResource | null = null
    started_datetime        : SDateTime
    updated_datetime        : SDateTime
    signin_datetime          : SDateTime | null = null
    last_active_datetime    : SDateTime
    signout_datetime         : SDateTime | null = null
    status                  : connect_instance_status = connect_instance_status.empty
    device_info   : typeof HostResource | null = null
    agent_app_info  : typeof HostResource | null = null
    request_location        : string | null = null
    utc_offset     : string = ''

	constructor(resp: typeof ConnectInstanceResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);

		// Load Datetimes
		this.started_datetime = new SDateTime(resp.started_datetime);
		this.updated_datetime = new SDateTime(resp.updated_datetime);
		this.signin_datetime = typeof resp.signin_datetime === 'string' ? new SDateTime(resp.signin_datetime) : null;
		this.last_active_datetime = new SDateTime(resp.last_active_datetime);
		this.signout_datetime = typeof resp.signout_datetime === 'string' ? new SDateTime(resp.signout_datetime) : null;
	}

	has_logged_in_user(): boolean {
		return false;
	}

	async end() {}
}

export default ConnectInstance;
export { ConnectInstanceResource };
