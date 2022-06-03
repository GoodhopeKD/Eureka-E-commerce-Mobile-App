// Core
import React from 'react';
import { connect } from "react-redux";
import RnBgTask from 'react-native-bg-thread';

// Display components
import { View, Text, FlatList, TouchableOpacity, SectionList, Image, StyleSheet } from 'react-native';
import { Button } from "react-native-elements";

// App core
import { Store, Product, User } from '../../../controller/index'

// Custom display components
import ProductLoopComponent from '../../components/loop-components/product-loop.component'
import StoreLoopComponent from '../../components/loop-components/store-loop.component';
import ListEmptyComponent from '../../components/list-empty.component';

class HomeScreen extends React.Component {

	state = {
		list_refreshing: false
	}

	first_run = false

	fetchLists = async () => {
		this.setState({ list_refreshing: true })
		await this.props.refreshHomeItems()
		this.setState({ list_refreshing: false })
	}

	openSingleItemScreen(focused_element, screen, screen_params = {}) {
		const focused_product = (focused_element instanceof Product) ? focused_element : null
		const focused_store = (focused_element instanceof Store) ? focused_element : null
		this.props.navigation.navigate(screen, { ...screen_params, focused_product, focused_store })
	}

	triggerScreenUpdate = () => {
		if (this.first_run) {
			const bgTask = async () => await this.props.refreshHomeItems()
			try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
			//this.setState({ trigger: true })
		} else { this.first_run = true }
	}

	componentDidMount = () => {
		this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => { this.triggerScreenUpdate() });
	}

	componentWillUnmount = () => {
		if (this._unsubscribeFocusListener) this._unsubscribeFocusListener();
	};

	render() {
		let sections_list = [
			{
				title: "Daily Deals",
				data: this.props.products_resource.structured_collection.todays_picks,
				data_type: 'product',
				horizontal: true,
			},
			{
				title: "Stores",
				data: this.props.stores_resource.home_list,
				data_type: 'store',
				see_all_onPress: () => this.props.navigation.navigate("StoresListScreen"),
			},
			{
				title: "Popular",
				data: this.props.products_resource.structured_collection.popular,
				data_type: 'product',
				horizontal: false,
				show_view_count: true,
				see_all_onPress: () => { this.props.navigation.navigate("ProductsEventsListScreen", { showing: "popular_products", title: "Popular" }) }
			},
			{
				title: "Market Square",
				data: this.props.products_resource.structured_collection.market_square_preview,
				data_type: 'product',
				see_all_onPress: () => { this.props.navigation.navigate("ProductsEventsListScreen", { showing: "market_square_products", title: "Market Square" }) }
			},
		]

		const auth_user = this.props.auth_user

		if (auth_user)
			sections_list.push({
				title: "Recommended",
				data: this.props.products_resource.structured_collection.recommended,
				data_type: 'product',
				horizontal: true,
			})

		return (
			<View testID='homeScreen' style={{ flex: 1 }}>
				<SectionList
					testID='sectionItems'
					sections={sections_list}
					keyExtractor={(item, index) => item + index}
					showsHorizontalScrollIndicator={false}
					stickySectionHeadersEnabled={false}
					initialNumToRender={22}
					refreshing={this.state.list_refreshing}
					onRefresh={this.fetchLists}
					contentContainerStyle={{ paddingBottom: 40 }}
					renderSectionHeader={({ section }) => {

						if ((!section.data.length && (section.title !== 'Market Square' || (auth_user && !auth_user.is_active_admin && section.title === 'Stores'))))
							return null

						const Header = () => {
							if (section.see_all_onPress) {
								return (
									<View style={{ flexDirection: "row", justifyContent: "space-between", padding: 20, marginTop: 10 }}>
										<Text style={{ fontSize: 24, fontWeight: "700" }}>
											{section.title}
										</Text>
										{section.data.length || section.title === 'Stores' ? (
											<TouchableOpacity testID='seeAllButton' onPress={section.see_all_onPress}>
												<Text style={{ fontSize: 18, color: "#888", paddingTop: 8 }}>
													see all
												</Text>
											</TouchableOpacity>
										) : null}
									</View>
								)
							} else {
								return (
									<Text style={{ fontSize: 24, fontWeight: '700', padding: 20, marginTop: 10 }}>{section.title}</Text>
								)
							}
						}

						if (section.data_type == 'product') {
							return (
								<>
									<Header />
									<FlatList
										data={section.data}
										keyExtractor={(item, key) => key.toString()}
										horizontal={section.horizontal}
										showsHorizontalScrollIndicator={false}
										initialNumToRender={3}
										maxToRenderPerBatch={3}
										numColumns={section.horizontal ? 1 : 2}
										contentContainerStyle={section.horizontal ? { paddingLeft: 20 } : {}}
										style={section.horizontal ? {} : { paddingHorizontal: (section.data.length) ? 10 : 0 }}
										ListEmptyComponent={<ListEmptyComponent />}
										renderItem={({ item }) => {
											const product = new Product(item)
											if (section.title == "Popular") {
												return null
												/*return (
													<View style={{ flex: 1, marginHorizontal: 20 }}>
														<View style={{ flexDirection: 'column' }}>
															<TouchableOpacity>
																<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
																	<Text style={{ flex: 0.2, fontSize: 18, fontWeight: '500' }}>I</Text>
																	<Image source={product.images[0]} style={{ height: 85, width: 85, marginRight: 25 }} />
																	<Text style={{ flex: 1, fontSize: 14, fontWeight: '500' }}>{product.name.length > 22 ? product.name.substring(0, 20) + '...' : product.name}</Text>
																</View>
															</TouchableOpacity>
															<View style={{ borderBottomWidth: StyleSheet.hairlineWidth, marginTop: 5 }}></View>
														</View>
													</View>
												)*/
											}
											return (
												<ProductLoopComponent
													product={product}
													auth_user={auth_user}
													local_pins={this.props.local_pins}
													horizontal={section.horizontal}
													show_view_count={section.show_view_count}
													updateParent={this.triggerScreenUpdate}
													onPress={() => this.openSingleItemScreen(product, "ProductCartViewScreen", { title: product.name })}
												/>
											)
										}}
									/>
								</>
							)
						}

						return <Header />

					}}
					renderItem={({ item, section, index }) => {
						if (section.data_type == 'store') {
							const store = new Store(item)
							return (
								<StoreLoopComponent
									store={store}
									onPress={() => this.openSingleItemScreen(store, "ProductsEventsListScreen", { showing: "items_from_store", title: store.name })}
								/>
							)
						}
						const product = new Product(item)
						if (section.title == "Popular") {
							return (
								<View style={{ flex: 1, marginHorizontal: 20 }}>
									<View style={{ flexDirection: 'column' }}>
										<TouchableOpacity onPress={() => this.openSingleItemScreen(product, "ProductCartViewScreen", { title: product.name })}>
											<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
												<Text style={{ flex: 0.2, fontSize: 18, fontWeight: '500' }}>{romanize(index + 1)}</Text>
												<Image source={product.images[0]} style={{ height: 85, width: 85, marginRight: 25 }} />
												<Text style={{ flex: 1, fontSize: 14, fontWeight: '500' }}>{product.name.length > 22 ? product.name.substring(0, 20) + '...' : product.name}</Text>
											</View>
										</TouchableOpacity>
										<View style={{ borderBottomWidth: index+1 < section.data.length ? StyleSheet.hairlineWidth : 0, marginTop: 5 }}></View>
									</View>
								</View>
							)
						}
						return null
					}}
					renderSectionFooter={({ section }) => {
						if (section.data.length && section.title!=="Popular" && section.see_all_onPress) {
							return (
								<Button
									title="See All"
									testID='seeAllAltButton'
									titleStyle={{ color: "#222" }}
									type="outline"
									TouchableComponent={TouchableOpacity}
									buttonStyle={{ borderColor: "#bbb", borderWidth: 1, borderRadius: 10 }}
									containerStyle={{ marginTop: 20, marginHorizontal: 20 }}
									onPress={section.see_all_onPress}
								/>
							)
						} else {
							return null
						}
					}}
				/>
			</View>
		)
	}
}

const mapStateToProps = (state) => {

	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data, ['cart', 'pinned_favourite_products']) : null,
		products_resource: state.products_resource,
		stores_resource: state.stores_resource,
		local_pins: state.local_pins_collection.data
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		refreshHomeItems: () => {
			return dispatch({ type: 'API_CALL', method: 'POST', endpoint: 'core/state' })
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);