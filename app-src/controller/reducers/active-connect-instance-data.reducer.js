import { ConnectInstanceResource } from '../types/element/ConnectInstance';
import SDateTime from '../types/auxilliary/SDateTime';

import { Platform } from 'react-native';
import * as Device from 'expo-device';

const pkg = require('../../../package.json');
const app = require('../../../app.json');

let device_info = {
	name: Device.osName + '',
	version: Device.osVersion + '',
	extra: 'Device name: ' + Device.deviceName + '; ' +
		'Brand: ' + Device.brand + '; ' +
		'Manufacturer: ' + Device.manufacturer + '; ' +
		'Model name: ' + Device.modelName + '; ' +
		'Device Year Class: ' + Device.deviceYearClass + '; ' +
		'Total Memory: ' + Device.totalMemory + '; ' +
		'Supported CPU architectures: ' + Device.supportedCpuArchitectures + '; ' +
		''
};

let agent_app_info = {
	name: app.displayName,
	version: pkg.version,
	extra: 'Eureka Mobile App;'
};

// Start Setup in react-native
if (Platform.OS === 'ios') {
	device_info.extra =
		device_info.extra + 'Model ID: ' + Device.modelId + '; ' +
		'Model name: ' + Device.modelName + '; ' +
		'kern.osversion: ' + Device.osBuildId + '; ' +
		''
}

if (Platform.OS === 'android') {
	device_info.extra =
		device_info.extra + 'Model ID: ' + Device.modelId + '; ' +
		'Design name: ' + Device.designName + '; ' +
		'Product name: ' + Device.productName + '; ' +
		'Build.DISPLAY: ' + Device.osBuildId + '; ' +
		'Build.ID: ' + Device.osInternalBuildId + '; ' +
		'Fingerprint: ' + Device.osBuildFingerprint + '; ' +
		'Platform API Level: ' + Device.platformApiLevel + '; ' +
		''
}

if (Platform.OS === 'web') {
	device_info.name = 'Web';
}

agent_app_info.name = app.displayName;
agent_app_info.version = pkg.version;
agent_app_info.extra = 'Eureka Mobile App;';
// End Setup in react-native

const initState = {
	...ConnectInstanceResource,
	signin_datetime: null,
	signout_datetime: null,
	auth_access_token: null,
	device_info,
	agent_app_info,
	utc_offset: SDateTime.timezoneUTCOffset()
};

const active_connect_instance_data_reducer = (state = initState, action) => {
	switch (action.type) {
		case 'SET_AUTH_ACCESS_TOKEN':
			return {
				...state,
				auth_access_token: action.auth_access_token
			};

		case 'UPDATE_STORED_CONNECT_INSTANCE':
			return {
				...state,
				...action.active_connect_instance_data,
				device_info,
				agent_app_info
			};

		case 'AUTH_USER_DATA_AND_ACTIVE_CONNECT_INSTANCE_DATA_CLEAR_ALL':
			return initState;

		default:
			return state;
	}
};

export default active_connect_instance_data_reducer;
