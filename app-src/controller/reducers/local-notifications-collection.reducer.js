import SDateTime from '../types/auxilliary/SDateTime';

const initial_state = {
	flash: [],
	push: []
};

const local_notifications_collection_reducer = (state = initial_state, action) => {
	switch (action.type) {
		case 'LOCAL_IN_APP_NOTIFICATIONS_ADD_ONE':
			return {
				...state,
				flash: [
					...state.flash,
					{
						...action.local_notification,
						created_datetime: new SDateTime() + '',
						id: Math.max(...state.flash.map((o) => o.id), 0) + 1
					}
				]
			};

		case 'LOCAL_PUSH_NOTIFICATIONS_ADD_ONE':
			return {
				...state,
				push: [
					...state.push,
					{
						...action.local_notification,
						created_datetime: new SDateTime() + '',
						id: Math.max(...state.push.map((o) => o.id), 0) + 1
					}
				]
			};

		case 'LOCAL_IN_APP_NOTIFICATIONS_MARK_OPENED':
			const flash_target = state.flash.find((element) => element.id == action.local_notification.id );
			return {
				...state,
				flash: [
					...state.flash.filter((notif) => notif.id !== action.local_notification.id),
					{ ...flash_target, opened_datetime: new SDateTime() + '' }
				]
			};

		case 'LOCAL_PUSH_NOTIFICATIONS_MARK_OPENED':
			const push_target = state.push.find((element) =>  element.id == action.local_notification.id );
			return {
				...state,
				push: [
					...state.push.filter((notif) => notif.id !== action.local_notification.id),
					{ ...push_target, opened_datetime: new SDateTime() + '' }
				]
			};

		case 'LOCAL_IN_APP_NOTIFICATIONS_REMOVE_ONE':
			return { ...state, flash: state.flash.filter((element) => element.id !== action.local_notification.id) };

		case 'LOCAL_PUSH_NOTIFICATIONS_REMOVE_ONE':
			return { ...state, push: state.push.filter((element) => element.id !== action.local_notification.id) };

		case 'LOCAL_NOTIFICATIONS_CLEAR_ALL':
			return initial_state;

		default:
			return state;
	}
};

export default local_notifications_collection_reducer;
