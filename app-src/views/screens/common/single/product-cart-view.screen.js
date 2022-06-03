import React, { Component } from 'react';
import { connect } from 'react-redux';
import RnBgTask from 'react-native-bg-thread';

import { StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SliderBox } from 'react-native-image-slider-box';
import RBSheet from "react-native-raw-bottom-sheet";
import Counter from 'react-native-counters';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ProductLoopComponent from '../../../components/loop-components/product-loop.component';
import { BottomSheetPicker, PickerOption } from '../../../components/bottom-sheet-picker.component';

import { User, Product, PinResource, Pin, flashMessage } from '../../../../controller/index';

const { width } = Dimensions.get('window');
const height = width * 1.2;

class ProductCartViewScreen extends Component {

	state = {
		focused_product: null,
		focused_pin_product_read: false,
		focused_pin: null,
		focused_pin_is_pinned: false,

		working: false,
		colour_choice: 'red',
		item_cart_count: 0,
		//item_cart_variations: [],

		working_buttons: {
			admin_suspend: false,
			seller_set_unavailable: false,
			seller_delete: false,
		}
	};

	flat_working_buttons = {
		admin_suspend: false,
		seller_set_unavailable: false,
		seller_delete: false,
	}

	nav_context = ''

	initial_focused_product = null
	related_products = []

	changePinState = () => {
		const focused_product = this.state.focused_pin.item;

		if (!focused_product.pinning.favourite && !focused_product.pinning.cart) {
			this.setState({ working: true })
			Pin.create({ pin_type: 'favourite', item_table: 'products', item_id: focused_product.id, item: focused_product })
				.then(() => this.props.flashMessage({ duration: 750, message: 'Added to favourites' }))
				.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
				.finally(() => this.loadFocusedElement())
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
							this.state.focused_pin.delete()
								.then(() => this.props.flashMessage({ duration: 750, message: 'Removed from favourites' }))
								.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
								.finally(() => this.loadFocusedElement())
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
							this.state.focused_pin.delete()
								.then(() => this.props.flashMessage({ duration: 750, message: 'Removed from cart' }))
								.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
								.finally(() => this.loadFocusedElement())
						}
					}
				],
				{ cancelabel: true }
			);
	};

	updateComponentItemCartCount(item_cart_count) {
		this.setState({ item_cart_count });
	}

	setNewFocusedElement = (focused_product, complete = true) => {
		this.updateCartItemDetails();
		this.props.navigation.setParams({ title: focused_product.name, focused_product });
		this.loadFocusedElement(complete);
	};

	updateCartItemDetails = () => {
		if (this.state.focused_pin_is_pinned) {
			const focused_pin = this.state.focused_pin;
			let update_object = {}
			if (this.state.item_cart_count !== focused_pin.item_cart_count) {
				update_object.item_cart_count = this.state.item_cart_count
			}
			/*if (this.state.item_cart_variations !== focused_pin.item_cart_variations) {
				update_object.item_cart_variations = this.state.item_cart_variations
			}*/
			if (Object.keys(update_object).length !== 0) {
				if (this.state.focused_pin_is_pinned) {
					const bgTask = async () => await focused_pin.update(update_object);
					try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
				} else {
					Object.assign(focused_pin, update_object);
				}
			}
		}
	};

	loadFocusedElement = (complete = false) => {
		setTimeout(async () => {
			if (this.props.route.params) {
				this.nav_context = this.props.route.params.nav_context ? this.props.route.params.nav_context : ''
				const focused_product = this.props.route.params.focused_product;
				this.setState({ focused_product, focused_pin_product_read: false })

				if (!complete) {
					let found = true
					await focused_product.read(!this.related_products.length).catch((error) => { found = false; this.props.navigation.goBack(); this.props.flashMessage({ duration: 3000, message: error.message }); })
					if (!found) return
				}

				let update_object = { focused_pin_product_read: true }
				const auth_user = this.props.auth_user

				if (focused_product.pinning.favourite) {

					const pinned_favourite_products = auth_user ? auth_user.pinned_favourite_products : this.props.local_pinned_favourite_products;
					const favourited_item = pinned_favourite_products.find((pin) => pin.item.id == focused_product.id)

					update_object.focused_pin = new Pin({
						...favourited_item,
						item_table: 'products',
						item: instanceToResource(focused_product)
					});
					update_object.focused_pin_is_pinned = true
				} else if (focused_product.pinning.cart) {
					const cart_pins = auth_user ? auth_user.cart.pins : this.props.local_pinned_cart_products;
					update_object.focused_pin = new Pin({
						...cart_pins.find((pin) => pin.item.id == focused_product.id),
						item: instanceToResource(focused_product)
					});
					update_object.focused_pin_is_pinned = true
				} else {
					update_object.focused_pin = new Pin({
						...PinResource,
						item_table: 'products',
						item: instanceToResource(focused_product),
						item_id: focused_product.id,
					});
				}
				update_object.working = false
				update_object.item_cart_count = update_object.focused_pin.item_cart_count
				//update_object.item_cart_variations = update_object.focused_pin.item_cart_variations

				this.initial_focused_product = this.initial_focused_product == null ? focused_product : this.initial_focused_product;

				if (!this.related_products.length && !['seller_area', 'admin_area'].includes(this.nav_context))
					this.related_products = [
						this.initial_focused_product,
						...focused_product.related_products.filter((product) => !(auth_user && product.adder_user_id == auth_user.id)).slice(0, 6)
					].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

				this.setState(update_object);
			}
		}, 0);
	};

	componentDidMount = () => {
		this.loadFocusedElement();
	};

	componentWillUnmount = () => {
		if (this._unsubscribeFocusListener) this._unsubscribeFocusListener();
		this.updateCartItemDetails();
	};

	/*translated_variations = () => {
		let translated_variations = []
		this.state.focused_product.variations.forEach(element => {
			let handled = false
			for (let index = 0; index < translated_variations.length; index++) {
				if (translated_variations[index].universal_name == element.name) {
					translated_variations[index].singles.push(element)
					handled = true
					break;
				}
			}
			if (!handled)
				translated_variations.push({ id: Math.max(...translated_variations.map((o) => o.id), 0) + 1, universal_name: element.name + '', singles: [element] })
		});

		return translated_variations
	}*/

	render() {
		const focused_product = (this.state.focused_pin_product_read) ? this.state.focused_pin.item : this.state.focused_product;

		//const translated_variations = (this.state.focused_pin_product_read) ? this.translated_variations() : [];

		if (!focused_product) {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#E9446A" />
				</View>
			);
		}

		const auth_user = this.props.auth_user

		const icon_name = focused_product.pinning.cart ? 'ios-cart' : 'ios-heart';
		const icon_color = (!focused_product.added_by_auth_user && (focused_product.pinning.order || focused_product.pinning.favourite || focused_product.pinning.cart)) || (focused_product.added_by_auth_user && focused_product.is_seller_pinned) ? '#E9446A' : '#a7a7a7';

		return (
			<View style={{ flex: 1 }}>
				<ScrollView testID='productContainer' showsVerticalScrollIndicator={false}>
					<View style={styles.container}>
						<View>
							<SliderBox
								testID='carouselImages'
								images={focused_product.images}
								sliderBoxHeight={850}
								dotColor="#E9446A"
								inactiveDotColor="#a7a7a7"
								style={styles.image}
								dotStyle={{ width: 12.5, height: 12.5, borderRadius: 15 }}
							/>
							{(focused_product.added_by_auth_user || (auth_user && auth_user.is_active_admin)) ? (
								<View style={{
									position: 'absolute', bottom: 0, paddingHorizontal: 4,
									borderTopWidth: 1,
									borderRightWidth: 1,
									borderBottomWidth: StyleSheet.hairlineWidth,
									borderColor: 'rgba(0,0,0,0.05)',
									backgroundColor: 'rgba(255,255,255,0.5)',
									borderTopRightRadius: 10
								}}>
									<Text>Ref: {focused_product.reference}</Text>
								</View>
							) : null}
						</View>

						<View style={styles.text}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={{ flex: 10, marginHorizontal: 0 }}>
									<Text testID='productPrice' style={{ fontSize: 20, fontWeight: '700' }}>{priceString(focused_product.price)}</Text>
								</View>
								<View style={{ flex: 1, alignItems: 'flex-end' }}>
									{focused_product.added_by_auth_user ? (
										<TouchableOpacity onPress={() => { }} disabled={this.state.working} style={{ marginTop: -5 }}>
											{this.state.working ? (
												<ActivityIndicator color={icon_color} />
											) : (
												<MaterialIcons name={'push-pin'} size={24} color={icon_color} />
											)}
										</TouchableOpacity>
									) : (
										<TouchableOpacity testID='likeProductButton' onPress={focused_product.pinning.order ? () => { } : this.changePinState} disabled={this.state.working} style={{ marginTop: -5 }}>
											{this.state.working ? (
												<ActivityIndicator color={icon_color} />
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

							<View style={{ flexDirection: 'row' }}>
								<Text testID='productTitle' style={{ flex: 3, fontSize: 18, paddingTop: 20 }}>{focused_product.name.length > 35 ? focused_product.name.substring(0, 35) + '...' : focused_product.name}</Text>
								<TouchableOpacity testID='bsButton' style={{ flex: 1, paddingTop: 20 }} onPress={() => this.product_details_bottom_sheet.open()}><Text style={{ fontSize: 16, textAlign: 'right' }}>More</Text></TouchableOpacity>
							</View>

							<RBSheet
								ref={ref => { this.product_details_bottom_sheet = ref; }}
								height={500}
								openDuration={250}
								closeDuration={200}
								customStyles={{ container: { paddingHorizontal: 20, borderTopRightRadius: 20, borderTopLeftRadius: 20 } }}
							>
								<Text style={{ fontSize: 20, fontWeight: 'bold', paddingBottom: 20, paddingTop: 20, textAlign: 'center' }}>{focused_product.name}</Text>
								<View style={{ borderBottomColor: '#ccc', borderBottomWidth: StyleSheet.hairlineWidth }} ></View>
								{this.state.focused_pin_product_read ?
									<ScrollView showsVerticalScrollIndicator={false}>
										<View style={{ paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>Category:</Text><Text style={{ fontSize: 18 }} > {focused_product.category.name}</Text></View>
										{/*translated_variations.map((t_variation) => (
											<View key={t_variation.id} style={{ paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>{t_variation.universal_name} (Options):</Text><Text style={{ fontSize: 18 }} > {t_variation.singles.map((variation, index) => {
												return variation.value + (variation.price && variation.price + '' ? ' (' + priceString(variation.price) + ')' : '') + ((index !== t_variation.singles.length - 1) ? ', ' : '')
											})}</Text></View>
										))*/}
										<View style={{ paddingTop: 20, }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>Details:</Text><Text style={{ fontSize: 18 }} >{focused_product.details}</Text></View>
										<View style={{ paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>Posted:</Text><Text style={{ fontSize: 18 }} > {ucfirst(focused_product.updated_datetime.prettyDatetime())}</Text></View>
										<View style={{ paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>Location:</Text><Text style={{ fontSize: 18 }} > {focused_product.commune} - {focused_product.wilaya}</Text></View>
										<View style={{ paddingBottom: 40 }}></View>
									</ScrollView>
									:
									<View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
										<ActivityIndicator size="large" color="#E9446A" />
									</View>
								}
							</RBSheet>

							{(focused_product.added_by_auth_user || this.nav_context == 'admin_area') ? (
								<>
									<View style={{ paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>Entry Type:</Text><Text style={{ fontSize: 18 }} >{focused_product.entry_type == 'product_and_or_service' ? 'Product and/or Service' : ucfirst(focused_product.entry_type)}</Text></View>
									{(focused_product.entry_type == 'product' || focused_product.entry_type == 'product_and_or_service') ? (
										<View style={{ paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>Stock Available:</Text><Text style={{ fontSize: 18 }} >{focused_product.stock_available}</Text></View>
									) : null}
								</>
							) : null}


							{focused_product.added_by_auth_user ? (
								<>
									<View style={{ paddingTop: 20, flexDirection: 'row' }}>
										<TouchableOpacity
											style={styles.adminOrSellerEditActionButton}
											onPress={() => {
												const callbackAction = () => {
													this._unsubscribeFocusListener = this.props.navigation.addListener('focus', async () => {
														const updated_product = await Product.findOne({ reference: focused_product.reference })
														this.setNewFocusedElement(new Product(updated_product))
													})
													this.props.navigation.navigate('ProductEditScreen', { focused_product })
												}
												if (focused_product.status == 'available') {
													Alert.alert(
														'Confirm',
														'If you edit a product while its online, it will be removed automatically from all lists pending review and confirmation by the moderators. Would you like to continue?',
														[
															{ text: 'No', onPress: () => { }, style: 'cancel' },
															{
																text: 'Yes',
																onPress: () => callbackAction()
															}
														],
														{ cancelabel: true }
													);
												} else {
													callbackAction()
												}

											}}
										>
											<Text style={styles.adminOrSellerEditActionButtonText} >
												Edit
											</Text>
										</TouchableOpacity>
										{focused_product.status == 'available' || (focused_product.status == 'unavailable' && ((focused_product.entry_type == 'product' && focused_product.stock_available > 0) || focused_product.entry_type !== 'product')) ? (
											<TouchableOpacity
												style={styles.adminOrSellerSetActionButton}
												onPress={() => {
													Alert.alert(
														'Confirm',
														'Make product ' + (focused_product.status == 'available' ? "Unavailable" : 'Available'),
														[
															{ text: 'No', onPress: () => { }, style: 'cancel' },
															{
																text: 'Yes',
																onPress: () => {
																	this.setState({ working: true })
																	const success_message = "Product is " + (focused_product.status == 'available' ? "temporarily unavailable" : 'now available')
																	focused_product.update({ status: focused_product.status == 'available' ? "unavailable" : 'available' })
																		.then(() => this.props.flashMessage({ duration: 750, message: success_message }))
																		.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
																		.finally(() => this.setNewFocusedElement(focused_product))
																}
															}
														],
														{ cancelabel: true }
													);
												}}
											>
												<Text style={styles.adminOrSellerSetActionButtonText} >
													Set {focused_product.status == 'available' ? "Unavailable" : 'Available'}
												</Text>
											</TouchableOpacity>
										) : null}
										<TouchableOpacity
											style={styles.adminOrSellerActionButton}
											onPress={() => {
												Alert.alert(
													'Confirm',
													'Delete Product',
													[
														{ text: 'No', onPress: () => { }, style: 'cancel' },
														{
															text: 'Yes',
															onPress: () => {
																this.setState({ working: true })
																focused_product.delete()
																	.then(() => { this.props.navigation.goBack(); this.props.flashMessage({ duration: 750, message: "Product deleted" }); })
																	.catch((error) => this.props.flashMessage({ duration: 3000, message: error.message }))
															}
														}
													],
													{ cancelabel: true }
												);
											}}
										>
											<Text style={styles.adminOrSellerActionButtonText} >
												Delete
											</Text>
										</TouchableOpacity>
									</View>
								</>
							) : (
								<>

									{this.state.focused_pin_product_read ? (
										<>
											{/*<Text testID='deliveryInfo' style={{ fontSize: 17, paddingTop: 20, color: '#777' }}>
												Estimated Delivery fee : {priceString(1000)}
											</Text>*/}

											{/*translated_variations.map((t_variation) => (
												<View key={t_variation.id} style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
													<View style={{ flex: 1 }} >
														<Text style={{ fontSize: 18, color: '#777' }}>{t_variation.universal_name}</Text>
													</View>

													<View style={{ flex: 1 }} >
													<BottomSheetPicker title_label={t_variation.universal_name} style={{ width: '100%' }} selected_value={this.state.color_choice} onValueChange={(ItemValue) => this.setState({ color_choice: ItemValue })}>
														{t_variation.singles.map((variation, index) => (
															<PickerOption key={index} label={variation.value + (variation.price && variation.price + '' ? ' (' + priceString(variation.price) + ')' : '')} value={variation.value + ""} />
														))}
													</BottomSheetPicker>
													</View>
												</View>
											))*/}

											{(focused_product.status == 'available') ? (<>
												<View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 20 }}>
													<View style={{ flex: 1 }} >
														<Text testID='quantityInfo' style={{ fontSize: 17, color: '#000' }}>Quantity</Text>
													</View>
													<View testID='counterButton' style={{ flex: 1, alignItems: 'flex-end' }}>
														<Counter
															start={this.state.item_cart_count}
															min={1}
															max={focused_product.entry_type == 'product' ? focused_product.stock_available : 100}
															onChange={this.updateComponentItemCartCount.bind(this)}
															buttonStyle={{
																borderColor: '#E9446A',
																borderWidth: 2,
																borderRadius: 25,
																paddingTop: 8,
																marginTop: -8,
															}}
															buttonTextStyle={{ color: '#000' }}
															countTextStyle={{ color: '#000' }}
														/>
													</View>
												</View>

												{(auth_user && auth_user.is_active_admin && this.nav_context !== 'seller_area') &&
													<View style={{ paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 18, fontWeight: '700' }}>Seller</Text><Text style={{ fontSize: 18 }} >{focused_product.seller ? focused_product.seller.name : ''}</Text></View>
												}

												<View style={{ flexDirection: 'row', marginTop: 35, justifyContent: 'space-between' }}>
													<TouchableOpacity
														testID='buyButton'
														style={styles.buyNowButton}
														disabled={this.state.working}
														onPress={() => {
															this.updateCartItemDetails();
															this.props.navigation.navigate('CheckoutScreen', { focused_pin: this.state.focused_pin });
														}}
													>
														{this.state.working ? (
															<ActivityIndicator color="#fff" />
														) : (
															<Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }} >
																{(focused_product.pinning.order) ? 'Buy another' : (focused_product.pinning.cart) ? "Proceed to checkout" : 'BUY NOW'}
															</Text>
														)}
													</TouchableOpacity>

													{focused_product.pinning.order &&
														<TouchableOpacity
															style={{ ...styles.buyNowOrdersButton, marginLeft: 10 }}
															disabled={this.state.working}
															onPress={() => { this.props.navigation.navigate('UserOrdersListScreen') }}
														>
															<Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }} >
																View Orders
															</Text>
														</TouchableOpacity>
													}

													{(!focused_product.pinning.cart && !focused_product.pinning.order) && (
														<TouchableOpacity
															testID='cartButton'
															style={styles.addToCartButton}
															disabled={this.state.working}
															onPress={() => {
																Alert.alert(
																	'Confirm',
																	'Add item to Cart',
																	[
																		{ text: 'No', onPress: () => { }, style: 'cancel' },
																		{
																			text: 'Yes',
																			onPress: () => {
																				this.setState({ working: true })
																				const action = this.state.focused_pin.id
																					? this.state.focused_pin.update({ pin_type: 'cart', item_cart_count: this.state.item_cart_count })
																					: Pin.create({ ...this.state.focused_pin, pin_type: 'cart', item_table: 'products', item_cart_count: this.state.item_cart_count, item_id: focused_product.id })
																				action
																					.then(() => this.props.flashMessage({ duration: 750, message: 'Added to cart' }))
																					.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
																					.finally(() => this.loadFocusedElement())
																			}
																		}
																	],
																	{ cancelabel: true }
																);
															}}
														>
															{this.state.working ? (
																<ActivityIndicator color="#222" />
															) : (
																<MaterialCommunityIcons name="cart-arrow-down" size={28} style={{ alignSelf: 'center' }} />
															)}
														</TouchableOpacity>
													)}
													{(focused_product.pinning.cart) && (
														<TouchableOpacity
															style={styles.addToCartButton}
															disabled={this.state.working}
															onPress={this.changePinState}
														>
															{this.state.working ? (
																<ActivityIndicator color="red" />
															) : (
																<MaterialCommunityIcons name="cart-remove" color={'red'} size={28} style={{ alignSelf: 'center' }} />
															)}
														</TouchableOpacity>
													)}
												</View>
											</>
											) : null}

											{(auth_user && auth_user.is_active_admin && this.nav_context !== 'seller_area') &&
												<View style={{ flexDirection: 'row' }}>
													<View style={{ paddingTop: 20, flex: 1 }}>
														<TouchableOpacity
															style={styles.adminOrSellerSuspendButton}
															onPress={() => {
																let update_object = {}
																let success_message = ''
																let prompt_message = ''

																switch (focused_product.status) {
																	case 'pending_confirmation':
																		update_object = { status: 'available' }
																		success_message = 'Product Confirmed'
																		prompt_message = 'Proceed with product confirmation'
																		break;

																	case 'suspended':
																		update_object = { status: 'available' }
																		success_message = 'Product unsuspended'
																		prompt_message = 'Proceed with lifting suspension'
																		break;

																	case 'available':
																		update_object = { status: 'suspended' }
																		success_message = 'Product Suspended'
																		prompt_message = 'Proceed with product suspension'
																		break;

																	default:
																		break;
																}

																Alert.alert(
																	'Confirm',
																	prompt_message,
																	[
																		{ text: 'No', onPress: () => { }, style: 'cancel' },
																		{
																			text: 'Yes',
																			onPress: () => {
																				this.setState({ working: true })
																				focused_product.update(update_object)
																					.then(() => this.props.flashMessage({ duration: 750, message: success_message }))
																					.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
																					.finally(() => this.setNewFocusedElement(focused_product))
																			}
																		}
																	],
																	{ cancelabel: true }
																);
															}}
														>
															{this.state.working ? (
																<ActivityIndicator color="#fff" />
															) : (
																<Text style={styles.adminOrSellerSuspendButtonText} >
																	{focused_product.status == 'pending_confirmation' ? 'Confirm Product' : (focused_product.status == 'suspended' ? 'Unsuspend' : 'Suspend')}
																</Text>
															)}

														</TouchableOpacity>
													</View>
												</View>
											}
										</>
									) : (
										<View style={{ alignItems: 'center', padding: 40 }}>
											<ActivityIndicator size="large" color="#E9446A" />
										</View>
									)}
								</>
							)}

						</View>

						{(!['seller_area', 'admin_area'].includes(this.nav_context) && this.related_products.length) ?
							<View style={{ flex: 1, paddingTop: 30 }}>
								<Text testID='moreProdSection' style={{ fontSize: 20, fontWeight: '700', paddingHorizontal: 20 }}>
									More products
								</Text>
								<View style={{ height: 150, marginTop: 20 }}>
									<ScrollView
										testID='moreProdSectionItems'
										horizontal={true} showsHorizontalScrollIndicator={false}>
										{this.related_products.map((product_resource, key) => {
											const product = (product_resource instanceof Product) ? product_resource : new Product(product_resource);
											return (
												<ProductLoopComponent
													key={key}
													product={product}
													auth_user={auth_user}
													local_pins={this.props.local_pins}
													index={key}
													horizontal
													classic
													updateParent={this.loadFocusedElement}
													onPress={() => product.id !== focused_product.id ? this.setNewFocusedElement(product, false) : {}}
												/>
											);
										})}
									</ScrollView>
								</View>
							</View>
							: null}
					</View>
				</ScrollView>
			</View>
		);
	}
}

const mapStateToProps = (state) => {
	let local_pinned_favourite_products = [];
	let local_pinned_cart_products = [];

	if (!state.auth_user_data) {
		state.local_pins_collection.data.forEach((element) => {
			if (element.pin_type == 'favourite' && element.item_table == 'products') local_pinned_favourite_products.push(new Pin(element));
			if (element.pin_type == 'cart') local_pinned_cart_products.push(new Pin(element));
		});
	}

	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data, ['all_pins']) : null,
		local_pinned_favourite_products,
		local_pinned_cart_products,
		local_pins: (!state.auth_user_data) ? state.local_pins_collection.data : []
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		flashMessage: (params) => dispatch(flashMessage(params))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductCartViewScreen);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 30
	},
	image: {
		width,
		height,
		resizeMode: 'cover'
	},
	text: {
		marginTop: 5,
		paddingTop: 15,
		paddingHorizontal: 15
	},
	adminOrSellerActionButton: {
		backgroundColor: '#E9446A',
		borderRadius: 10,
		marginHorizontal: 1,
		height: 40,
		flex: 1,
		justifyContent: 'center'
	},
	adminOrSellerActionButtonText: {
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	adminOrSellerSuspendButton: {
		backgroundColor: '#000',
		borderRadius: 10,
		marginHorizontal: 1,
		height: 40,
		flex: 1,
		justifyContent: 'center'
	},
	adminOrSellerSuspendButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	adminOrSellerEditActionButton: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderRadius: 10,
		marginHorizontal: 1,
		height: 40,
		flex: 1,
		justifyContent: 'center'
	},
	adminOrSellerEditActionButtonText: {
		color: 'black',
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	adminOrSellerSetActionButton: {
		backgroundColor: '#000',
		borderRadius: 10,
		marginHorizontal: 1,
		height: 40,
		flex: 1,
		justifyContent: 'center'
	},
	adminOrSellerSetActionButtonText: {
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	buyNowButton: {
		backgroundColor: '#E9446A',
		borderRadius: 15,
		height: 70,
		flex: 7,
		justifyContent: 'center'
	},
	buyNowOrdersButton: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderRadius: 15,
		height: 70,
		flex: 7,
		justifyContent: 'center'
	},
	addToCartButton: {
		borderColor: '#000',
		borderWidth: 1,
		backgroundColor: '#fff',
		borderRadius: 15,
		height: 70,
		flex: 3,
		marginLeft: 10,
		justifyContent: 'center'
	},
});
