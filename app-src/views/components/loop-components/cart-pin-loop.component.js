import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

class CartPinLoopComponent extends React.PureComponent {
	render() {
		const focused_cart_pin = this.props.cart_pin;
		return (
			<TouchableOpacity style={{ flex: 1, marginHorizontal:10 }} onPress={this.props.onPress} >
			<View style={styles.feedItem}>
				<Image source={focused_cart_pin.item.images[0]} style={styles.avatar} />
				<View style={{ flex: 1 }}>
					<View
						style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}
					>
						<Text style={styles.price}>
							{priceString(focused_cart_pin.item_cart_count * focused_cart_pin.item.price) +
								' (' +
								priceString(focused_cart_pin.item.price) +
								'*' +
								focused_cart_pin.item_cart_count +
								')'}
						</Text>
						<Text style={styles.name}>{focused_cart_pin.item.name}</Text>
					</View>
				</View>
			</View>
			</TouchableOpacity>
		);
	}
}

export default CartPinLoopComponent;

const styles = StyleSheet.create({
	feedItem: {
		backgroundColor: '#FFF',
		borderRadius: 20,
		padding: 8,
		flexDirection: 'row',
		marginVertical: 8
	},
	avatar: {
		width: 90,
		height: 90,
		marginRight: 16
	},
	price: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	name: {
		fontSize: 16,
		paddingTop: 7
	}
});
