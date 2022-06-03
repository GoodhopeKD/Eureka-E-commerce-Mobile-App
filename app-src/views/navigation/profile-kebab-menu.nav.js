import React, { Component } from 'react';

import { View, Linking } from 'react-native';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default class ProfileKebabMenuNav extends Component {

	state = {
		visible: false,
	}

	showMenu = () => {
		this.setState({ visible: true })
	};
	hideMenu = () => {
		this.setState({ visible: false })
	};

	navigateTo = (target) => {
		this.props.navigation.navigate(target);
		this.hideMenu();
	};

	render() {
		return (
			<View style={this.props.menustyle}>
				<Menu
					visible={this.state.visible}
					onRequestClose={this.hideMenu}
					anchor={
						<Button
							onPress={this.showMenu}
							labelStyle={{ color: 'black' }}
							color={'rgba(255,255,255,0)'}
							style={{ padding: 0 }}
							compact={true}
						>
							<MaterialCommunityIcons name="dots-vertical" size={26} />
						</Button>
					}
				>
					<MenuItem
						onPress={() => {
							Linking.openURL('https://www.facebook.com/eurekapp');
						}}
					>
						Terms And Conditions
					</MenuItem>

					<MenuDivider />

					<MenuItem
						onPress={() => {
							Linking.openURL('https://www.facebook.com/eurekapp');
						}}
					>
						About Eureka
					</MenuItem>
				</Menu>
			</View>
		);
	}
}