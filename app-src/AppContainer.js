import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
/*
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { createFirestoreInstance } from 'redux-firestore';
*/

import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './controller/utils/globals';
import { store, persistor } from './controller/config/redux.config';
import { navigationRef } from './controller/utils/navigation-ref';

import FlashSnackbarComponent from './views/components/flash-snackbar.component'
import MergePinsPromptComponent from './views/components/merge-pins-prompt.component'
import AppNavigation from './views/navigation/root-stack.nav';

/*
import firebase from './controller/config/firebase.config';

const rrfProps = {
	firebase,
	config: {
		useFirestoreForProfile: true,
		userProfile: 'users',
	},
	dispatch: store.dispatch,
	createFirestoreInstance,
};
*/

export default function AppContainer() {
	return (
		<StoreProvider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				{/*<ReactReduxFirebaseProvider {...rrfProps}>*/}
				<NavigationContainer ref={(ref) => { navigationRef.current = ref }}>
					{Platform.OS === 'ios' && <StatusBar barStyle='dark-content' backgroundColor='#000' />}
					<SafeAreaProvider>
						<MergePinsPromptComponent />
						<AppNavigation />
						<FlashSnackbarComponent />
					</SafeAreaProvider>
				</NavigationContainer>
				{/*</ReactReduxFirebaseProvider>*/}
			</PersistGate>
		</StoreProvider>
	);
}
