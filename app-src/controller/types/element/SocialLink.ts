import SDateTime from '../auxilliary/SDateTime';

enum social_sites {
	facebook = 'facebook',
	instagram = 'instagram',
	twitter = 'twitter'
}

enum social_link_owner_table {
	stores = 'stores',
	events = 'events'
}

const SocialLinkResource = {
    id              : 0,
    sitename        : '',
    username_url    : '',
    owner_table     : '',
    owner_id        : 0,
    adder_user_id   : null,
    added_datetime  : '',
}

class SocialLink 
{
    id              : number = 0
    sitename        : social_sites = social_sites.facebook 
    username_url    : string = ''
    owner_table     : social_link_owner_table = social_link_owner_table.stores
    owner_id        : number = 0
    adder_user_id   : number | null = null
    added_datetime  : SDateTime

	constructor(resp: typeof SocialLinkResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
		this.added_datetime = new SDateTime(resp.added_datetime);
	}
}

export default SocialLink;
export { SocialLinkResource };
