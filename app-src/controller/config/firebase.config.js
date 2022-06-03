import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Web app's Firebase configuration
var firebaseConfig = {
	apiKey: 'AIzaSyCdrgM7m4hQ_raHW6rq0RJuebRJAeqQ8ms',
	authDomain: 'eureka-30c21.firebaseapp.com',
	dataAPI_URL: 'https://eureka-30c21.firebaseio.com',
	projectId: 'eureka-30c21',
	storageBucket: 'eureka-30c21.appspot.com',
	messagingSenderId: '695278736150',
	appId: '1:695278736150:web:a666634242c3a398bb3637'
};

// Initialize Firebase
if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}

firebase.firestore();

export default firebase;
