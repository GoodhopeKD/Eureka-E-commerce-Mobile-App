import axios from 'axios';
import { Platform } from 'react-native'; // To be removed when website is uploaded to the internet
import * as Device from 'expo-device';  // To be removed when website is uploaded to the internet

// This is where eventually we'll host our website
let WEB_URL = 'https://www.eureka-app.com';
let API_URL = 'https://api.eureka-app.com';

// Setting this to true while we await uploading the website on an actual web server
const __DEV__ = false

if (__DEV__) {
	if (Device.isDevice) {
		// Connect Device and Computer with backend website to the same Wifi and Get IP address
		// On Mac: "System Preferences > Network > Wi-Fi > Advanced > TCP/IP > IPv4 Address"
		// On Windows: Open cmd, run command "ipconfig" and get IPv4 Address
		const HOST_MACHINE_IP = '192.168.43.186'
		//const HOST_MACHINE_IP = '192.168.0.106'
		WEB_URL = 'http://' + HOST_MACHINE_IP + '/eureka/public';
	} else {
		if (Platform.OS === 'android') {
			WEB_URL = 'http://10.0.2.2/eureka/public';
		} else {
			WEB_URL = 'http://127.0.0.1/eureka/public';
		}
	}
	API_URL = WEB_URL + '/api';
}

export default axios.create({
	baseURL: API_URL
});

export { API_URL, WEB_URL };
