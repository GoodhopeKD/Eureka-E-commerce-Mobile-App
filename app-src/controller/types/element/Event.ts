import { store } from '../../config/redux.config';
import SDateTime from '../auxilliary/SDateTime';
import EntityDisplayCardResource from '../extra/EntityDisplayCardResource';
import Image, { ImageResource } from '../element/Image';
import SocialLink, { SocialLinkResource } from '../element/SocialLink';
import { images_update_object_params } from '../../utils/special-update-object-params';
import { pagination_auto_nav, pagination_page_nav, getPaginationEndpoint } from '../../utils/laravel-pagination';

const find_params = {
	id: 0,
	reference: '',
}

const get_all_params = {
	indexer: '',
	query_string: '',
}

const EventResource = {
	id: 0,
	reference: '',
	title: '',
	description: '',
	venue: '',
	contact_details: '',
	other_details: '',
	event_datetime: '',
	utc_offset: '',
	event_poster: ImageResource,
	social_link: SocialLinkResource,
	added_datetime: '',
	adder_admin_user_id: null,
	adder: EntityDisplayCardResource,
}

class SEvent {
	id: number = 0
	reference: string = ''
	title: string = ''
	description: string = ''
	venue: string = ''
	contact_details: string = ''
	other_details: string = ''
	event_datetime: SDateTime
	utc_offset: string = ''
	display_datetime: string = ''
	event_poster: Image | null
	social_link: SocialLink | null
	added_datetime: SDateTime
	adder_admin_user_id: number | null = null
	adder_admin: typeof EntityDisplayCardResource | null = null

	constructor(resp: typeof EventResource) {
		this.populate(resp)
	}

	populate(resp: typeof EventResource) {
		resp = JSON.parse(JSON.stringify(resp))
		// Clear empty values and arrays and Load Inline
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
		Object.assign(this, resp);

		this.event_datetime = new SDateTime(resp.event_datetime);
		this.display_datetime = this.utc_offset ? this.event_datetime.prettyDatetime() : this.event_datetime.prettyDate()
		this.added_datetime = new SDateTime(resp.added_datetime);
		this.event_poster = typeof resp.event_poster === typeof ImageResource ? new Image(resp.event_poster) : null;
		this.social_link = typeof resp.social_link === typeof ImageResource ? new SocialLink(resp.social_link) : null;
	}

	async read() {
		if (this.reference)
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'GET',
					endpoint: 'events/{reference}',
					data: { reference: this.reference }
				})
				.then((response: any) => {
					this.populate(response)
					return Promise.resolve();
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});

		return Promise.reject({ message: "Event reference not found" });
	}

	static async getAll(pagination: pagination_auto_nav | typeof pagination_page_nav | null = null, params: typeof get_all_params | null = null) {
		let endpoint = 'events/all';

		let data = {}

		if (params) {
			if (params.indexer == 'search') {
				endpoint = 'core/search/{pool}/{query_string}'
				data['pool'] = 'events'
				data['query_string'] = params.query_string
			}
		}

		if (pagination !== null) {
			endpoint = getPaginationEndpoint(endpoint, pagination, 'events');
		}

		return store
			.dispatch({
				type: 'API_CALL',
				method: 'GET',
				endpoint,
				data
			})
			.then((response: any) => {
				store.dispatch({ type: 'EVENTS_SET_RESOURCE_COLLECTION', collection: response });
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});
	}

	static async findOne(params: typeof find_params) {
		const endpoint = params.reference ? 'events/{reference}' : (params.id ? 'events/{id}' : '')
		if (endpoint)
			return await store
				.dispatch({
					type: 'API_CALL',
					method: 'GET',
					endpoint,
					data: params
				})
				.then((response: any) => {
					return Promise.resolve(response);
				})
				.catch((error: any) => {
					return Promise.reject(error);
				});

		return Promise.reject({ message: "Input a reference or an id to find product" });
	}


	static async create(resp: typeof EventResource) {

		const endpoint_2 = 'events'
		const endpoint_1 = endpoint_2 + '/upload_images'

		let images = [resp.event_poster]

		const data = new FormData();
		for (let i = 0; i < images.length; i++) {
			data.append("images[]", images[i]);
		}

		const response = await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: endpoint_1,
				data_has_files: true,
				data,
			}).catch((error: any) => {
				return Promise.reject(error);
			});

		for (let i = 0; i < images.length; i++) {
			const new_image = response.images.find(t => t.old_name == images[i].name)
			images[i].name = new_image.name
			images[i].uri = new_image.uri
		}

		resp.event_poster = images[0]

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'POST',
				endpoint: endpoint_2,
				data: resp,
			})
			.then((response: any) => {
				return Promise.resolve(response.event)
			}).catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async update(resp: typeof EventResource, images_update_object: typeof images_update_object_params | null = null) {

		let should_update = false
		let update_object = {};

		if (resp.title && resp.title !== this.title) update_object['title'] = resp.title;
		if (resp.description && resp.description !== this.description) update_object['description'] = resp.description;
		if (resp.venue && resp.venue !== this.venue) update_object['venue'] = resp.venue;
		if (resp.event_datetime && resp.event_datetime !== this.event_datetime + "") update_object['event_datetime'] = resp.event_datetime;
		if ((resp.utc_offset || resp.utc_offset === null) && resp.utc_offset !== this.utc_offset) update_object['utc_offset'] = resp.utc_offset;
		if (resp.contact_details && resp.contact_details !== this.contact_details) update_object['contact_details'] = resp.contact_details;
		if (resp.other_details && resp.other_details != this.other_details) update_object['other_details'] = resp.other_details;

		should_update = images_update_object && images_update_object.new_images_to_upload && images_update_object.new_images_to_upload.length ? true : should_update
		should_update = images_update_object && images_update_object.old_images_to_delete_from_storage && images_update_object.old_images_to_delete_from_storage.length ? true : should_update
		should_update = Object.keys(update_object).length ? true : should_update

		if (!should_update) return Promise.reject({ message: "No values were modified" });
		update_object['images'] = [resp.event_poster]

		const endpoint_2 = 'events/{id}'
		const endpoint_1 = endpoint_2.replace('/{id}', '') + '/upload_images'

		if (images_update_object && images_update_object.new_images_to_upload && images_update_object.new_images_to_upload.length) {

			const data = new FormData();
			for (let i = 0; i < images_update_object.new_images_to_upload.length; i++) {
				data.append("images[]", images_update_object.new_images_to_upload[i]);
			}

			const response = await store
				.dispatch({
					type: 'API_CALL',
					method: 'POST',
					endpoint: endpoint_1,
					data_has_files: true,
					data,
				}).catch((error: any) => {
					return Promise.reject(error);
				});

			for (let i = 0; i < update_object['images'].length; i++) {
				const new_image = response.images.find(t => t.old_name == update_object['images'][i].name)
				if (new_image) {
					update_object['images'][i].name = new_image.name
					update_object['images'][i].uri = new_image.uri
				}
			}
		}

		update_object['event_poster'] = update_object['images'][0]

		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'PUT',
				endpoint: endpoint_2,
				data: { ...update_object, ...images_update_object, id: this.id },
			})
			.then((response: any) => {
				this.populate(response.event)
				return Promise.resolve(response.event)
			}).catch((error: any) => {
				return Promise.reject(error);
			});
	}

	async delete() {
		return await store
			.dispatch({
				type: 'API_CALL',
				method: 'DELETE',
				endpoint: 'events/{id}',
				data : { id: this.id }
			})
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((error: any) => {
				return Promise.reject(error);
			});

	}
}

export default SEvent;
export { EventResource };
