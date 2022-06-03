import moment from 'moment';

export const firebase_call_middleware = (user, callbackAction) => {
	return (dispatch, getState, { getFirebase }) => {
		const firestore = getFirebase().firestore();

		firestore
			.collection('users')
			.doc(user.id)
			.set(
				{
					...user
				},
				{ merge: true }
			)
			.then(() => {
				dispatch({
					type: 'UPDATE_REMOTE_USER',
					user
				});
				if (typeof callbackAction === 'function') {
					callbackAction();
				}
			})
			.catch((err) => {
				dispatch({
					type: 'UPDATE_REMOTE_USER_ERROR',
					err
				});
			});
	};
};
