import SDateTime from '../auxilliary/SDateTime';
import { store } from '../../config/redux.config';

enum address_owner_table {
    users = 'users',
    orders = 'orders'
}

const AddressResource = {
    id: 0, // 
    surname: '',
    name_s: '',
    address_line_one: '',
    address_line_two: '',
    postal_code: '',
    commune: '',
    wilaya: '',
    owner_table: '',
    owner_id: 0,
    adder_user_id: null,
    added_datetime: ''
}

class Address {
    id: number = 0
    surname: string = ''
    name_s: string = ''
    address_line_one: string = ''
    address_line_two: string = ''
    postal_code: string = ''
    commune: string = ''
    wilaya: string = ''
    owner_table: address_owner_table = address_owner_table.users
    owner_id: number = 0
    adder_user_id: number | null = null
    added_datetime: SDateTime

    constructor(resp: typeof AddressResource) {
        // Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
        for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
        Object.assign(this, resp);

        this.added_datetime = new SDateTime(resp.added_datetime);
    }

    static async create(resp: typeof AddressResource) {
        const endpoint = resp.owner_table + '/{owner_id}/addresses'

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

    async update(resp: typeof AddressResource) {
        let update_object = {};

        if (resp.surname && resp.surname !== this.surname) update_object['surname'] = resp.surname;
        if (resp.name_s && resp.name_s !== this.name_s) update_object['name_s'] = resp.name_s;
        if (resp.address_line_one && resp.address_line_one !== this.address_line_one) update_object['address_line_one'] = resp.address_line_one;
        if (resp.address_line_two && resp.address_line_two !== this.address_line_two) update_object['address_line_two'] = resp.address_line_two;
        if (resp.postal_code && resp.postal_code !== this.postal_code) update_object['postal_code'] = resp.postal_code;
        if (resp.commune && resp.commune !== this.commune) update_object['commune'] = resp.commune;
        if (resp.wilaya && resp.wilaya !== this.wilaya) update_object['wilaya'] = resp.wilaya;

        if (!Object.keys(update_object).length) return Promise.reject({ message: "No values were modified" });

        const endpoint = this.owner_table + '/{owner_id}/addresses/{id}'

        return await store
            .dispatch({
                type: 'API_CALL',
                method: 'PUT',
                endpoint,
                data: { ...update_object, id: this.id, owner_id: this.owner_id }
            })
            .then((response: any) => {
                return Promise.resolve(response);
            })
            .catch((error: any) => {
                return Promise.reject(error);
            });

    }
}

export { AddressResource };
export default Address;