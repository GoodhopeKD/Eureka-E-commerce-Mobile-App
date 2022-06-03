import SDateTime from '../auxilliary/SDateTime';

const LogItemResource = {
    id                  : 0,
    action              : '',
    action_user_id      : null,
    connect_instance_id : null,
    thing_table         : '',
    thing_id            : 0,
    thing_column        : '',
    update_initial_value: null,
    update_final_value  : null,
    multistep_operation_hash  : null,
    action_datetime     : '',
}

class LogItem {
    id                  : number = 0
    action              : string = ''
    action_user_id      : number | null = null
    connect_instance_id : number | null = null
    thing_table         : string = ''
    thing_id            : number = 0
    thing_column        : string = ''
    update_initial_value: string | null = null
    update_final_value  : string | null = null
    multistep_operation_hash  : string | null = null
    action_datetime     : SDateTime

	constructor(resp: typeof LogItemResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.action_datetime = new SDateTime(resp.action_datetime);
	}
}

export default LogItem;
export { LogItemResource };
