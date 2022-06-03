import { store } from '../../config/redux.config';
import SDateTime from '../auxilliary/SDateTime';

enum phone_owner_table {
	users = 'users',
	stores = 'stores'
}

enum phone_tag {
	whatsapp = 'whatsapp',
	calls = 'calls',
	calls_or_whatsapp = 'calls_or_whatsapp'
}

const PhoneResource = {
    id              : 0, // 
    country_code    : "",
    number          : "",
    tag             : "",
    owner_table     : "",
    owner_id        : 0,
    adder_user_id   : null,
    added_datetime  : ""
}

class Phone
{
    id              : number = 0
    country_code    : string = ""
    number          : string = ""
    tag             : phone_tag = phone_tag.whatsapp
    owner_table     : phone_owner_table = phone_owner_table.users
    owner_id        : number = 0
    adder_user_id   : number | null = null 
    added_datetime  : SDateTime

	constructor(resp: typeof PhoneResource) {
        // Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.added_datetime = new SDateTime(resp.added_datetime);
	}

    pretty_tag(){
        if (this.tag=='calls_or_whatsapp')
            return 'calls/whatsapp'
        return this.tag
    }

    static async create(resp: typeof PhoneResource) {
        const endpoint = resp.owner_table + '/{owner_id}/phones'

        return await store
            .dispatch({
                type: 'API_CALL',
                method: 'POST',
                endpoint,
                data: resp
            })
            .then((response: any) => {
                return Promise.resolve(response);
            })
            .catch((error: any) => {
                return Promise.reject(error);
            });
    }

    async update(resp: typeof PhoneResource) {
        let update_object = {};

        if (resp.country_code && resp.country_code !== this.country_code) update_object['country_code'] = resp.country_code;
        if (resp.number && resp.number !== this.number) update_object['number'] = resp.number;
        if (resp.tag && resp.tag !== this.tag) update_object['tag'] = resp.tag;

        if (!Object.keys(update_object).length) return Promise.reject({ message: "No values were modified" });

        const endpoint = this.owner_table + '/{owner_id}/phones/{id}'

        return await store
            .dispatch({
                type: 'API_CALL',
                method: 'PUT',
                endpoint,
                data: { ...update_object, id: this.id, owner_id: this.owner_id }
            })
            .then((response: any) => {
                return Promise.resolve(response.phone);
            })
            .catch((error: any) => {
                return Promise.reject(error);
            });
    }
}

export { PhoneResource };
export default Phone;
