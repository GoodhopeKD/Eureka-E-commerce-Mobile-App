import SDateTime from '../auxilliary/SDateTime';

enum notified_entity_table {
	users = 'users',
	admins = 'admins',
	stores = 'stores'
}

const EntityNotificationResource = {
    id              : 0,
    message_title   : '',
    message_body    : '',
    entity_table    : '',
    entity_id       : 0,
    created_datetime: '',
    opened_datetime : null,
}

class EntityNotification{
    id              : number = 0
    message_title   : string = ''
    message_body    : string = ''
    entity_table    : notified_entity_table = notified_entity_table.users
    entity_id       : number = 0
    created_datetime: SDateTime
    opened_datetime : SDateTime | null = null
    opened          : boolean = false

	constructor(resp: typeof EntityNotificationResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.created_datetime = new SDateTime(resp.created_datetime);
		this.opened_datetime = typeof resp.opened_datetime === 'string' ? new SDateTime(resp.opened_datetime) : null;
		this.opened = this.opened_datetime ? true : false;
	}
}

export { EntityNotificationResource };
export default EntityNotification;
