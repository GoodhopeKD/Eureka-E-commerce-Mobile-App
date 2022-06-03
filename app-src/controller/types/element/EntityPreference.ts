import SDateTime from '../auxilliary/SDateTime';

enum preference_entity_table {
	users = 'users',
	admins = 'admins',
	stores = 'stores'
}

const EntityPreferenceResource = {
    id              : 0,
    key             : '',
    value           : '',
    entity_table    : '',
    entity_id       : 0,
    updated_datetime: '',
}

class EntityPreference{
    id              : number = 0
    key             : string = ''
    value           : string = ''
    entity_table    : preference_entity_table = preference_entity_table.users
    entity_id       : number = 0
    updated_datetime: SDateTime

	constructor(resp: typeof EntityPreferenceResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.updated_datetime = new SDateTime(resp.updated_datetime);
	}
}

export { EntityPreferenceResource };
export default EntityPreference;
