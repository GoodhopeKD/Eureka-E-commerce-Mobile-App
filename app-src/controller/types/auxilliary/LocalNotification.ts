import { store } from '../../config/redux.config';
import SDateTime from '../auxilliary/SDateTime';

enum notification_group {
	push = 'push',
	flash = 'flash'
}

const LocalNotificationResource = {
	id: 0,
	group: '',
	message_title: '',
	message_body: '',
	created_datetime: '',
	opened_datetime: null,
}

class LocalNotification {
	id: number = 0
	group: notification_group = notification_group.flash
	message_title: string = ''
	message_body: string = ''
	created_datetime: SDateTime
	opened_datetime: SDateTime | null = null
	opened: boolean = false

	constructor(resp: typeof LocalNotificationResource) {
		// Clear empty values and arrays and Load Inline
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; } }
		Object.assign(this, resp);
		this.created_datetime = new SDateTime(resp.created_datetime);
		this.opened_datetime = typeof resp.opened_datetime === 'string' ? new SDateTime(resp.opened_datetime) : null;
		this.opened = this.opened_datetime ? true : false;
	}

	static async create(message_title: string, message_body: string, group: notification_group | string) {
		store.dispatch({
			type: 'LOCAL_' + group.toUpperCase() + '_NOTIFICATIONS_ADD_ONE',
			local_notification: { ...LocalNotificationResource, message_title, message_body, group }
		});
	}

	mark_opened() {
		store.dispatch({
			type: 'LOCAL_' + this.group.toUpperCase() + '_NOTIFICATIONS_MARK_OPENED',
			local_notification: { id: this.id }
		});
	}

	remove() {
		store.dispatch({
			type: 'LOCAL_' + this.group.toUpperCase() + '_NOTIFICATIONS_REMOVE_ONE',
			local_notification: { id: this.id }
		});
	}
}

export { LocalNotificationResource };
export default LocalNotification;
