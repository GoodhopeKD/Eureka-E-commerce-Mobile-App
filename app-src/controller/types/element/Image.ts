import SDateTime from '../auxilliary/SDateTime';
import { WEB_URL } from '../../config/axios.config'

enum image_owner_table {
	users = 'users',
	stores = 'stores',
	products = 'products',
    events = 'events',
}

enum image_tag {
	display_image = 'display_image',
	banner_image = 'banner_image',
	product_image = 'product_image',
	event_image = 'event_image'
}

const ImageResource = {
    id              : 0,
    name            : '',
    type            : '',
    uri             : '',
    height          : 0,
    width           : 0, 
    title           : '', 
    alt             : '',
    tag             : '',
    owner_table     : '',
    owner_id        : 0,
    adder_user_id   : null,
    added_datetime  : ''
}

class Image {
    id              : number = 0
    name            : string = ''
    type            : string = ''
    uri             : string = ''
    height          : number = 0
    width           : number = 0
    name_name       : string
    name_ext        : string
    title           : string = ''
    alt             : string = '' 
    tag             : image_tag = image_tag.display_image
    owner_table     : image_owner_table = image_owner_table.users
    owner_id        : number = 0
    adder_user_id   : number | null = null 
    added_datetime  : SDateTime

	constructor(resp: typeof ImageResource) {
        // Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
        
        this.uri = WEB_URL+this.uri.replace(WEB_URL,'');
		const name_elems = this.name.split('.');
		this.name_ext = name_elems[name_elems.length-1];
        this.name_name = this.name.split('.'+this.name_ext)[0];
		this.added_datetime = new SDateTime(resp.added_datetime);
	}
}

export { ImageResource };
export default Image;