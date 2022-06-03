import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ProgressBar } from 'react-native-paper';

const progressBarColors = (status) => {
	var color = '#1FB448'
	switch (status) {
		case 'cancelled': color = 'red'; break;
		case 'completed': color = 'blue'; break;
		default: color = '#1FB448'; break;
	}
	return color
}

class OrderLoopComponent extends React.PureComponent {
	render() {
		const focused_order = this.props.order
		return (
			<TouchableOpacity style={{ flex: 1, marginHorizontal: 10 }} onPress={this.props.onPress} >
				<View style={styles.feedItem}>
					<Image source={focused_order.product.images[0]} style={styles.avatar} />
					<View style={{ flex: 1 }}>
						<Text style={styles.price}>{priceString((focused_order.amount_due_final) ? focused_order.amount_due_final : focused_order.amount_due_provisional)}</Text>
						<Text style={styles.name}>{focused_order.product.name} (*{focused_order.product_count})</Text>
						<Text style={styles.ref}>Ref: {focused_order.reference}</Text>
						<ProgressBar progress={focused_order.progress} color={progressBarColors(focused_order.status)} style={{ borderRadius: 20 }} />
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

export default OrderLoopComponent;

const styles = StyleSheet.create({
	header: {
		height: Platform.OS === 'android' ? 60 : 40,
		alignItems: 'center',
		borderBottomColor: '#dddddd',
		borderBottomWidth: 1
	},
	feed: {
		marginHorizontal: 15
	},
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
		paddingTop: 5
	},
	ref: {
		fontSize: 14,
		paddingTop: 5,
		color: '#aaa',
		marginBottom: 7,
	}
});
