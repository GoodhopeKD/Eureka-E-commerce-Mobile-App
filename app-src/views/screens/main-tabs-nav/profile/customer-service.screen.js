import React, { Component } from 'react';

import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class CustomerServiceScreen extends Component {

	render() {
		return (
			<View style={{ flex: 1 }}>
				<View style={styles.container}>
					<TouchableOpacity
						onPress={() => Linking.openURL('mailto:contact.eurekapp@gmail.com')}
						title="support@eureka.com"
					>
						<Ionicons name="ios-mail" size={48} color="#004B87" />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => Linking.openURL('https://twitter.com/evrekapp/')}
						title="www.twitter.com"
					>
						<Ionicons name="logo-twitter" size={48} color="#1DA1F2" />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => Linking.openURL('https://www.instagram.com/evrekapp/')}
						title="www.instagram.com"
					>
						<Ionicons name="logo-instagram" size={48} color="#C13584" />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => Linking.openURL('https://www.facebook.com/evrekapp/')}
						title="www.facebook.com"
					>
						<Ionicons name="logo-facebook" size={48} color="#4267B2" />
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginHorizontal: 30,
		justifyContent: 'space-between',
		marginTop: 20
	},
	header: {
		height: Platform.OS === 'android' ? 60 : 40,
		alignItems: 'center',
		borderBottomColor: '#dddddd',
		borderBottomWidth: 1
	},
	backButton: {
		position: 'absolute',
		top: Platform.OS === 'android' ? 10 : -5,
		height: 32,
		width: 32,
		left: 15,
		alignItems: 'center',
		justifyContent: 'center'
	}
});
