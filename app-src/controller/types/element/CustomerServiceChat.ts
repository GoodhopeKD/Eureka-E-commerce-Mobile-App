import SDateTime from '../auxilliary/SDateTime';
import EntityDisplayCardResource from '../extra/EntityDisplayCardResource';

const CustomerServiceChatResource = {
    id              : 0,
    client_user_id  : null,
    client          : EntityDisplayCardResource,
    corresponding_admin_user_id  : null,
    corresponding_admin          : EntityDisplayCardResource,
    last_sent_message_body    : '',
    last_message_sender_user_id  : null,
    opened_datetime                 : '',
    closed_datetime                 : null,
}

class CustomerServiceChat {
    id                              : number = 0
    client_user_id                  : number | null = null
    client                          : typeof EntityDisplayCardResource | null = null
    corresponding_admin_user_id     : number | null = null
    corresponding_admin             : typeof EntityDisplayCardResource | null = null
    last_sent_message_body          : string = ''
    last_message_sender_user_id     : number | null = null
    opened_datetime         : SDateTime
    closed_datetime         : SDateTime | null = null

	constructor(resp: typeof CustomerServiceChatResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.opened_datetime = new SDateTime(resp.opened_datetime);
        this.closed_datetime = typeof resp.closed_datetime === 'string' ? new SDateTime(resp.closed_datetime) : null;
	}
}

export { CustomerServiceChatResource };
export default CustomerServiceChat;
