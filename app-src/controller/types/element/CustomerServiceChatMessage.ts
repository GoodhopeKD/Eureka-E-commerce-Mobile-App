import SDateTime from '../auxilliary/SDateTime';

const CustomerServiceChatMessageResource = {
    id              : 0,
    chat_id  : null,
    message_body    : '',
    sender_user_id  : null,
    sent_datetime                 : '',
}

class CustomerServiceChatMessage {
    id                              : number = 0
    chat_id                  : number | null = null
    message_body          : string = ''
    sender_user_id     : number | null = null
    sent_datetime         : SDateTime

	constructor(resp: typeof CustomerServiceChatMessageResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.sent_datetime = new SDateTime(resp.sent_datetime);
	}
}

export { CustomerServiceChatMessageResource };
export default CustomerServiceChatMessage;
