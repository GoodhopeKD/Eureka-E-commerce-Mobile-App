/* Library Imports */
import { combineReducers, applyMiddleware, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';
import { getFirebase } from 'react-redux-firebase';

/* Reducer Imports */
import local_notifications_collection_reducer from '../reducers/local-notifications-collection.reducer';
import local_pins_collection_reducer from '../reducers/local-pins-collection.reducer';
import local_search_terms_collection_reducer from '../reducers/local-search-terms-collection.reducer';

import active_connect_instance_data_reducer from '../reducers/active-connect-instance-data.reducer';
import auth_user_data_reducer from '../reducers/auth-user-data.reducer';
import system_status_data_reducer from '../reducers/system-status-data.reducer';
import datalists_collection_reducer from '../reducers/datalists-collection.reducer';

import events_resource_reducer from '../reducers/events-resource.reducer';
import orders_resource_reducer from '../reducers/orders-resource.reducer';
import products_resource_reducer from '../reducers/products-resource.reducer';
import stores_resource_reducer from '../reducers/stores-resource.reducer';
import users_resource_reducer from '../reducers/users-resource.reducer';

/* middleware Imports */
//import { firebase_call_middleware } from "../actions/firebase.actions"
import { web_API_call_middleware } from '../actions/web-API.actions';

const root_persist_config = {
	key: 'root',
	storage: AsyncStorage,
	whitelist: [
		'local_search_terms_collection',
		'local_notifications_collection',
		'local_pins_collection',
		'active_connect_instance_data',
	]
};

// Persisted so as to not keep resending the same notification
const local_notifications_collection_persist_config = {
	key: 'local_notifications_collection',
	storage: AsyncStorage
};

const local_pins_collection_persist_config = {
	key: 'local_pins_collection',
	storage: AsyncStorage
};

const local_search_terms_collection_persist_config = {
	key: 'local_search_terms_collection',
	storage: AsyncStorage
};

const active_connect_instance_persist_config = {
	key: 'active_connect_instance_data',
	storage: AsyncStorage,
	whitelist: ['auth_access_token', 'app_access_token']
};

const root_reducer = persistReducer(root_persist_config, combineReducers({
	local_notifications_collection: persistReducer(local_notifications_collection_persist_config, local_notifications_collection_reducer),
	local_pins_collection: persistReducer(local_pins_collection_persist_config, local_pins_collection_reducer),
	local_search_terms_collection: persistReducer(local_search_terms_collection_persist_config, local_search_terms_collection_reducer),

	active_connect_instance_data: persistReducer(active_connect_instance_persist_config, active_connect_instance_data_reducer),
	auth_user_data: auth_user_data_reducer,
	system_status_data: system_status_data_reducer,
	datalists_collection: datalists_collection_reducer,

	events_resource: events_resource_reducer,
	orders_resource: orders_resource_reducer,
	products_resource: products_resource_reducer,
	stores_resource: stores_resource_reducer,
	users_resource: users_resource_reducer,
}));

const middlewares = [
	thunk.withExtraArgument({ getFirebase }),
	web_API_call_middleware,
	//firebase_call_middleware,
];
const store = createStore(root_reducer, applyMiddleware(...middlewares));
const persistor = persistStore(store)
export { store, persistor };
