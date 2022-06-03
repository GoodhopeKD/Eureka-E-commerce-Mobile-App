import React from 'react';
import { connect } from 'react-redux';

import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Alert, SectionList, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ListItem } from 'react-native-elements';

import { User, flashMessage } from '../../../controller/index';

const { height, width } = Dimensions.get('window');

class ProfileScreen extends React.Component {

	state = {
		working: false
	}

	signOutPrompt = () => {
		Alert.alert(
			'Sign out',
			'Are you sure you want to leave Eureka?',
			[
				{ text: 'No', onPress: () => {}, style: 'cancel' },
				{
					text: 'Yes',
					onPress: () => {
						this.setState({ working: true })
						this.props.auth_user.signOut().then(() => {
							this.setState({ working: false })
							this.props.flashMessage({ duration: 750, message: "You're now logged out" })
						})
					}
				}
			],
			{ cancelable: true }
		);
	}

	render() {
		const auth_user = this.props.auth_user

		const conditional_icon_color = auth_user ? '#E9446A' : 'rgba(85, 85, 85, .3)';
		const conditional_text_color = auth_user ? '#222' : 'rgba(85, 85, 85, .3)';

		let sections_list = [
			{
				data: [
					{
						text: 'My orders',
						icon_name: 'cube-outline',
						onPress: () => (auth_user ? this.props.navigation.navigate('UserOrdersListScreen') : {}),
						requires_auth: true
					},
					{
						text: 'Favourites',
						icon_name: 'heart-outline',
						onPress: () =>
							this.props.navigation.navigate('ProductsEventsListScreen', {
								showing: 'favourites',
								title: 'Favourites'
							})
					},
					{
						text: (auth_user && (auth_user.has_seller_products || auth_user.owns_store)) ? (auth_user.owns_store) ? 'Store management' : 'Seller area' : 'Sell',
						icon_name: 'cash-outline',
						onPress: () => (auth_user ? this.props.navigation.navigate( (auth_user.has_seller_products || auth_user.owns_store) ? 'SellerAreaTabsNav' : 'ProductEditScreen' ) : {}),
						requires_auth: true
					},
					{
						text: 'My details',
						icon_name: 'cog-outline',
						onPress: () => (auth_user ? this.props.navigation.navigate('MyDetailsScreen') : {}),
						requires_auth: true
					},
				],
			},
			{
				data: [
					{
						text: 'Customer service',
						icon_name: 'desktop-outline',
						onPress: () => this.props.navigation.navigate('CustomerServiceScreen')
					},
				],
			},
			{
				data: [
					auth_user
						? { text: 'Sign out', icon_name: 'log-out-outline', onPress: this.signOutPrompt }
						: {
							text: 'Sign in',
							icon_name: 'log-in-outline',
							onPress: () => this.props.navigation.navigate('SignInScreen')
						}
				],
			},
		]

		if (auth_user && auth_user.is_active_admin) {
			sections_list[1].data.push(
				{
					text: 'Admin area',
					icon_name: 'person-circle-outline',
					onPress: () => this.props.navigation.navigate('AdminAreaTabsNav')
				},
			)
		}

		return (
			<View style={{ flex: 1 }}>
				<View style={{ paddingHorizontal: 10 }}>
					<View style={{ width: width - 20, height: 100, marginTop: 10 }}>
						<View style={{ width: '100%', height: '100%', paddingTop: 5 }}>
							<Text style={styles.txt}>Hello,</Text>
							<Text style={styles.title}>
								{auth_user ? this.props.auth_user.name_s : 'Guest'}
							</Text>
							<Text style={styles.status}>
								Status:
								<Text style={{ color: '#E9446A' }}>Baller 🏀</Text>
							</Text>
						</View>
					</View>
				</View>

				<SectionList
					sections={sections_list}
					keyExtractor={(item, index) => item + index}
					showsHorizontalScrollIndicator={false}
					stickySectionHeadersEnabled={false}
					initialNumToRender={15}
					style={{ flex: 1, marginHorizontal: 10 }}
					renderSectionHeader={() => <View style={{ marginBottom: 30 }}></View>}
					renderItem={({ item }) => {
						return (
							<TouchableOpacity onPress={item.onPress}>
								<ListItem bottomDivider >

									{this.state.working && item.text == 'Sign out' ? (
										<View style={{ paddingVertical: 5.5, paddingHorizontal: 4 }}>
											<ActivityIndicator color="#E9446A" />
										</View>
									) : (
										<Ionicons
											name={item.icon_name}
											color={item.requires_auth ? conditional_icon_color : '#E9446A'}
											size={28}
										/>
									)}

									<ListItem.Content>
										<ListItem.Title
											style={{
												fontSize: 16.5,
												color: item.requires_auth ? conditional_text_color : '#222'
											}}
										>
											{item.text}
										</ListItem.Title>
									</ListItem.Content>
									<ListItem.Chevron />
								</ListItem>
							</TouchableOpacity>
						);
					}}
				/>
			</View>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data) : null,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		flashMessage: (params) => dispatch(flashMessage(params))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);

const styles = StyleSheet.create({
	txt: {
		color: '#000',
		textAlign: 'right',
		fontSize: 17
	},
	title: {
		color: '#000',
		textAlign: 'right',
		fontSize: 20,
		fontWeight: '500'
	},
	status: {
		paddingTop: 5,
		color: '#000',
		textAlign: 'right',
		fontSize: 17
	},
	cardText: {
		fontWeight: '500'
	}
});
