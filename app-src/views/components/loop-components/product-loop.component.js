import React from 'react';
import { connect } from 'react-redux';

import { View, Text, Image, TouchableOpacity, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Pin, flashMessage } from '../../../controller/index';

const { width } = Dimensions.get('window');

class ProductLoopComponent extends React.PureComponent {

	state = {
		working: false,
	}

	changePinState = () => {
		const focused_product = this.props.product;

		if (!focused_product.pinning.favourite && !focused_product.pinning.cart) {
			this.setState({ working: true })
			Pin.create({ pin_type: 'favourite', item_table: 'products', item_id: focused_product.id, item: focused_product })
				.then(() => this.props.flashMessage({ duration: 750, message: 'Added to favourites' }))
				.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
				.finally(() => {
					this.setState({ working: false })
					if (this.props.updateParent) this.props.updateParent()
				})
		}

		if (focused_product.pinning.favourite)
			Alert.alert(
				'Confirm',
				'Remove item from Favourites',
				[
					{ text: 'No', onPress: () => { }, style: 'cancel' },
					{
						text: 'Yes',
						onPress: () => {
							this.setState({ working: true })
							const auth_user = this.props.auth_user
							const pins = auth_user ? auth_user.pinned_favourite_products : this.props.local_pins;
							const focused_pin = new Pin(pins.find((pin) => pin.item_table == "products" && pin.pin_type == "favourite" && pin.item_id == focused_product.id))
							focused_pin.delete()
								.then(() => this.props.flashMessage({ duration: 750, message: 'Removed from favourites' }))
								.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
								.finally(() => {
									this.setState({ working: false })
									if (this.props.updateParent) this.props.updateParent();
								})
						}
					}
				],
				{ cancelable: true }
			);

		if (focused_product.pinning.cart)
			Alert.alert(
				'Confirm',
				'Remove item from Cart',
				[
					{ text: 'No', onPress: () => { }, style: 'cancel' },
					{
						text: 'Yes',
						onPress: () => {
							this.setState({ working: true })
							const auth_user = this.props.auth_user
							const pins = auth_user ? auth_user.cart.pins : this.props.local_pins;
							const focused_pin = new Pin(pins.find((pin) => pin.item_table == "products" && pin.pin_type == "cart" && pin.item_id == focused_product.id))
							focused_pin.delete()
								.then(() => this.props.flashMessage({ duration: 750, message: 'Removed from cart' }))
								.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
								.finally(() => {
									this.setState({ working: false })
									if (this.props.updateParent) this.props.updateParent();
								})
						},
					}
				],
				{ cancelable: true }
			);
	};

	render() {
		const focused_product = this.props.product;
		const icon_name = focused_product.pinning.cart ? 'ios-cart' : 'ios-heart';

		const icon_color = (!focused_product.added_by_auth_user && (focused_product.pinning.order || focused_product.pinning.favourite || focused_product.pinning.cart)) || (focused_product.added_by_auth_user && focused_product.is_seller_pinned) ? '#E9446A' : '#a7a7a7';

		const first_item_margin = this.props.index == 0 ? { marginLeft: 20 } : {};

		return (
			<TouchableOpacity style={{ flex: 1 }} onPress={this.props.onPress} >
				{(this.props.horizontal) ?
					<View style={{ height: 147, width: 130, marginRight: 20, ...first_item_margin }}>
						<View style={{ width: 130, height: 100 }}>
							<Image
								source={focused_product.images[0]}
								style={{ flex: 1, width: null, height: null }}
								resizeMode="cover"
								resizeMethod="resize"
							/>
							{this.props.show_view_count && (
								<View
									style={{
										position: 'absolute',
										flexDirection: 'row',
										paddingHorizontal: 3,
										borderBottomWidth: 1,
										borderRightWidth: 1,
										borderColor: 'rgba(0,0,0,0.05)',
										backgroundColor: 'rgba(255,255,255,0.3)',
										borderBottomRightRadius: 10
									}}
								>
									<Ionicons name="ios-eye" size={20} color="#a7a7a7" />
									<Text>{focused_product.views.today}</Text>
								</View>
							)}
						</View>
						<View style={{ flex: 1, paddingTop: 5 }}>
							<View style={{ flexDirection: 'row' }}>
								<View style={{ flex: 5 }}>
									<Text style={{ fontWeight: 'bold' }}>
										{priceString(focused_product.price)}
									</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'flex-end' }}>
									{focused_product.added_by_auth_user ? (
										<View style={{ marginTop: -5 }}>
											<MaterialIcons name={'store'} size={24} color={icon_color} />
										</View>
									) : (
										<TouchableOpacity
											testID='likeButton'
											style={{ marginTop: -5 }}
											onPress={focused_product.pinning.order ? () => { } : this.changePinState}
											disabled={this.state.working}
										>
											{this.state.working ? (
												<View style={{ paddingTop: 6.5 }}><ActivityIndicator color={icon_color} /></View>
											) : (
												focused_product.pinning.order ? (
													<MaterialCommunityIcons name={'truck-delivery-outline'} size={24} color={icon_color} />
												) : (
													<Ionicons name={icon_name} size={24} color={icon_color} />
												)
											)}
										</TouchableOpacity>
									)}
								</View>
							</View>
							<Text style={{ paddingTop: 4 }}>
								{focused_product.name.length > 22 ? focused_product.name.substring(0, 20) + '...' : focused_product.name}
							</Text>
						</View>
					</View>
					:
					<View
						style={
							!this.props.classic ? (
								{ padding: 10, flex: 1 }
							) : (
								{ width: width / 2 - 30, height: width / 2 - 30, paddingBottom: 5 }
							)
						}
					>
						<View style={{ height: 200 }}>
							<Image
								source={focused_product.images[0]}
								style={{ flex: 1, height: null, width: null }}
								resizeMode="cover"
								resizeMethod="resize"
							/>
							{(this.props.nav_context && this.props.nav_context == 'seller_area') ? (
								<View
									style={{
										position: 'absolute',
										flexDirection: 'row',
										paddingHorizontal: 5,
										borderBottomWidth: 1,
										borderRightWidth: 1,
										borderColor: 'rgba(0,0,0,0.05)',
										backgroundColor: 'rgba(255,255,255,0.8)',
										borderBottomRightRadius: 10
									}}
								>
									<Ionicons name="ios-eye" size={20} color="#a7a7a7" style={{ marginRight: 5 }} />
									<Text style={{ marginRight: 5 }}>Today: {focused_product.views.today}</Text>
									<Text>Total: {focused_product.views.total}</Text>
									<MaterialIcons name={'circle'} size={20} style={{ marginLeft: 5 }} color={
										(focused_product.status == "pending_confirmation" ? "orange" : (focused_product.status == "available" ? "green" : "red"))
									} />
								</View>
							) : null}
						</View>
						<View style={{ flexDirection: 'row', paddingTop: 7 }}>
							<View style={{ flex: 5 }}>
								<Text style={{ fontSize: 15, fontWeight: '800' }}>{priceString(focused_product.price)}</Text>
							</View>
							{(this.props.nav_context && this.props.nav_context == "admin_area") ? (
								<View>
									<View style={{ marginTop: -5 }}>
										<MaterialIcons name={'circle'} size={24} color={
											(focused_product.status == "pending_confirmation" ? "orange" : "red")
										} />
									</View>
								</View>
							) : (
								<View style={{ flex: 1, alignItems: 'flex-end' }}>
									{focused_product.added_by_auth_user ? (
										<View style={{ marginTop: -5 }}>
											<MaterialIcons name={'store'} size={24} color={icon_color} />
										</View>
									) : (
										<TouchableOpacity
											testID='likeButton'
											style={{ marginTop: -5 }}
											onPress={focused_product.pinning.order ? () => { } : this.changePinState}
											disabled={this.state.working}
										>
											{this.state.working ? (
												<View style={{ paddingTop: 6.5 }}><ActivityIndicator color={icon_color} /></View>
											) : (
												focused_product.pinning.order ? (
													<MaterialCommunityIcons name={'truck-delivery-outline'} size={24} color={icon_color} />
												) : (
													<Ionicons name={icon_name} size={24} color={icon_color} />
												)
											)}
										</TouchableOpacity>
									)}
								</View>
							)}
						</View>
						<Text style={{ fontSize: 15, paddingTop: 5 }}>
							{focused_product.name.length > 22 ? focused_product.name.substring(0, 20) + '...' : focused_product.name}
						</Text>
					</View>
				}
			</TouchableOpacity>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		flashMessage: (params) => dispatch(flashMessage(params))
	};
};

export default connect(null, mapDispatchToProps)(ProductLoopComponent);