import SDateTime from '../auxilliary/SDateTime';
import SEvent, { EventResource } from '../element/Event';
import PermissionInstance, { PermissionInstanceResource } from '../relation/PermissionInstance';
import EntityNotification, { EntityNotificationResource } from '../element/EntityNotification';
import EntityDisplayCardResource from '../extra/EntityDisplayCardResource';

enum admin_status {
	active = 'active',
	revoked = 'revoked'
}

const AdminResource = {
    id                  : 0,
    user_id             : 0,
    status              : '',
    adder_admin_user_id : null,
	adder_admin        	: EntityDisplayCardResource,
    added_datetime      : '',
    permission          : [],
    events_added        : [],
    notifications       : [],
    broadcast_notifications : [],
}

class Admin
{
    id                      : number = 0
    user_id                 : number = 0
    status                  : admin_status = admin_status.active
    adder_admin_user_id     : number | null = null
	adder_admin            	: typeof EntityDisplayCardResource | null = null
    added_datetime          : SDateTime
    permission              : PermissionInstance[] = []
    events_added            : SEvent[] = []
    notifications           : EntityNotification[] = []
    broadcast_notifications : EntityNotification[] = []

	constructor(resp: typeof AdminResource) {
		// Clear empty values and arrays and Load Inline
        resp = JSON.parse(JSON.stringify(resp))
		for (var key in resp) { if (resp.hasOwnProperty(key)) { if (resp[key] == null || (Array.isArray(resp[key]) && !resp[key].length)) delete resp[key]; }}
		Object.assign(this, resp);
		
		this.added_datetime = new SDateTime(resp.added_datetime);
		this.permission = [];
		this.notifications = [];
		this.broadcast_notifications = [];
		this.events_added = [];

		// Load arrays
		if (resp.permission && resp.permission.length !== 0) {
			resp.permission.forEach((element: typeof PermissionInstanceResource) => {
				this.permission.push(new PermissionInstance(element));
			});
		}

		if (resp.notifications && resp.notifications.length !== 0) {
			resp.notifications.forEach((element: typeof EntityNotificationResource) => {
				this.notifications.push(new EntityNotification(element));
			});
		}

		if (resp.broadcast_notifications && resp.broadcast_notifications.length !== 0) {
			resp.broadcast_notifications.forEach((element: typeof EntityNotificationResource) => {
				this.broadcast_notifications.push(new EntityNotification(element));
			});
		}

		if (resp.events_added && resp.events_added.length !== 0) {
			resp.events_added.forEach((element: typeof EventResource) => {
				this.events_added.push(new SEvent(element));
			});
		}
	}
}

export { AdminResource };
export default Admin;
