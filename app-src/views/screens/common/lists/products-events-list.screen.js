import React from 'react';
import { connect } from 'react-redux';
import RnBgTask from 'react-native-bg-thread';

import { View, ActivityIndicator, FlatList, Dimensions, StyleSheet, Text, TextInput } from 'react-native';
import { BottomSheet, ListItem, FAB } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons'

import { Pin, Product, SEvent, User, Input } from '../../../../controller/index';

import EventLoopComponent from '../../../components/loop-components/event-loop.component';
import ProductLoopComponent from '../../../components/loop-components/product-loop.component';
import ListEmptyComponent from '../../../components/list-empty.component';

const { width } = Dimensions.get('window');

class ProductsEventsListScreen extends React.Component {

	working = false

	state = {
		events_loaded: false,
		market_square_products_loaded: false,
		popular_products_loaded: false,
		search_results_loaded: false,
		seller_products_loaded: false,
		items_from_store_loaded: false,
		items_from_location_loaded: false,
		favourites_loaded: false,
		admin_products_action_list_loaded: false,

		list: [],
		list_loaded: false,
		list_full: false,
		list_refreshing: false,

		list_bkp_data: {
			list: []
		},
		items_type: 'products',

		search_nav_visible: false,
		input: { query_string: new Input() }
	};

	handleInputChange(field, value, use_as_is = false) {
		let input = this.state.input
		input[field] = (use_as_is) ? value : new Input(value)
		this.setState({ input })
	}

	openSingleItemScreen(focused_element, screen, screen_params = {}) {
		const focused_product = (focused_element instanceof Product) ? focused_element : null
		const focused_event = (focused_element instanceof SEvent) ? focused_element : null
		this.props.navigation.navigate(screen, { ...screen_params, focused_product, focused_event })
	}

	async universalGetAll(Type, indicator_var_name, pagination = null, get_all_params = null, to_list_bkp_data = false) {
		if (pagination && this.state.list_full) return Promise.resolve();
		if (!this.working) {
			this.working = true
			setTimeout(
				() => {
					Type.getAll(pagination, get_all_params)
						.then((response) => {
							if (!response.data) return Promise.resolve();
							let update_object = {
								list: pagination ? this.state.list.concat(response.data) : response.data,
								list_loaded: true,
								list_full: response.meta.current_page === response.meta.last_page,
							};
							update_object[indicator_var_name] = true;
							if (to_list_bkp_data) {
								this.setState({ list_bkp_data: update_object });
							} else {
								this.setState(update_object);
							}
							this.working = false
							return Promise.resolve();
						})
						.catch((error) => {
							this.working = false
							return Promise.reject(error);
						})
				}, 0
			);
		} else {
			return Promise.resolve();
		}
	}

	componentDidMount = () => {
		switch (this.props.route.params.showing) {
			case 'events':
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					this.setState({ list_refreshing: show_list_refreshing_loader, items_type: "events" });
					await this.universalGetAll(SEvent, 'events_loaded')
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(SEvent, 'events_loaded', 'next');
				this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
					const bgTask = () => this.initialFetch(false)
					try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
				});
				break;

			case 'market_square_products':
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
					await this.universalGetAll(Product, 'market_square_products_loaded')
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(Product, 'market_square_products_loaded', 'next');
				this.initialFetch(false);
				break;

			case 'popular_products':
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
					await this.universalGetAll(Product, 'popular_products_loaded', null, { indexer: 'popular' })
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(Product, 'popular_products_loaded', 'next', { indexer: 'popular' })
				this.initialFetch(false);
				break;

			case 'search_results':
				const query_string = this.props.route.params.query_string
				this.initialFetch = async () => {
					let update_object = { list_refreshing: true }
					if (this.state.input.query_string + '' == '')
						update_object.input = { ...this.state.input, query_string: new Input(query_string) }
					this.setState(update_object, async () => {
						await this.universalGetAll(Product, 'search_results_loaded', null, { indexer: 'search', query_string: this.state.input.query_string + '' })
						this.setState({ list_refreshing: false })
						const bgTask = () => {
							const fetchEvents = () => {
								if (this.working === true) {//we want it to match
									setTimeout(fetchEvents, 100);//wait 50 millisecnds then recheck
									return;
								}
								this.universalGetAll(SEvent, 'search_results_loaded', null, { indexer: 'search', query_string: this.state.input.query_string + '' }, true)
							}
							fetchEvents();
						}
						try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
					});
				};
				this.nextFetch = () => {
					const Type = (this.state.items_type == 'products') ? Product : SEvent
					this.universalGetAll(Type, 'search_results_loaded', 'next', { indexer: 'search', query_string: this.state.input.query_string + '' })
				}
				this.initialFetch();
				break;

			case 'from_seller_available':
				const seller_table = this.props.auth_user.owns_store ? 'stores' : 'users'
				const seller_id = this.props.auth_user.owns_store ? this.props.auth_user.store_owned.id : this.props.auth_user.id
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
					await this.universalGetAll(Product, 'from_seller_available_loaded', null, { indexer: 'from_seller_available', seller_table, seller_id })
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(Product, 'from_seller_available_loaded', 'next', { indexer: 'from_seller_available', seller_table, seller_id });
				this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
					const bgTask = () => this.initialFetch(false)
					try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
				});
				break;

			case 'from_seller_all':
				const seller_table_ = this.props.auth_user.owns_store ? 'stores' : 'users'
				const seller_id_ = this.props.auth_user.owns_store ? this.props.auth_user.store_owned.id : this.props.auth_user.id
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
					await this.universalGetAll(Product, 'from_seller_all_loaded', null, { indexer: 'from_seller_all', seller_table: seller_table_, seller_id: seller_id_ })
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(Product, 'from_seller_all_loaded', 'next', { indexer: 'from_seller_all', seller_table: seller_table_, seller_id: seller_id_ });
				this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
					const bgTask = () => this.initialFetch(false)
					try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
				});
				break;

			case 'items_from_store':
				const store_id = this.props.route.params.focused_store.id
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
					await this.universalGetAll(Product, 'items_from_store_loaded', null, { indexer: 'from_seller_available', seller_table: 'stores', seller_id: store_id })
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(Product, 'items_from_store_loaded', 'next', { indexer: 'from_seller_available', seller_table: 'stores', seller_id: store_id });
				this.initialFetch(false);
				break;

			case 'items_from_location':
				const location_name = this.props.route.params.location_name
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
					await this.universalGetAll(Product, 'items_from_location_loaded', null, { indexer: 'from_location', location_name })
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(Product, 'items_from_location_loaded', 'next', { indexer: 'from_location', location_name })
				this.initialFetch(false);
				break;

			case 'favourites':
				this.initialFetch = () => {
					setTimeout(async () => {
						const user = this.props.auth_user
						const list =
							user
								? user.pinned_favourite_products
								: this.props.local_pins.filter((element) => element.pin_type == 'favourite');
						this.setState({ favourites_loaded: true, list_loaded: true, list, list_full: true });
					}, 0);
				};
				this.nextFetch = () => { };
				this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
					const bgTask = () => this.initialFetch()
					try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
				});
				break;

			case 'admin_products_action_list':
				this.initialFetch = async (show_list_refreshing_loader = true) => {
					if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
					await this.universalGetAll(Product, 'admin_products_action_list_loaded', null, { indexer: 'admin_products_action_list' })
					if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
				};
				this.nextFetch = () => this.universalGetAll(Product, 'admin_products_action_list_loaded', 'next', { indexer: 'admin_products_action_list' });
				this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
					const bgTask = () => this.initialFetch(false)
					try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
				});
				break;

			default:
				break;
		}
	};

	componentWillUnmount() {
		if (this._unsubscribeFocusListener) this._unsubscribeFocusListener();
	}

	render() {

		const ListFooterComponent = () =>
			this.state.list_loaded && this.state.list_full ? (
				<View style={{ paddingBottom: 20 }} />
			) : (
				<View style={{ alignItems: 'center', padding: 40 }}>
					<ActivityIndicator size="large" color="#E9446A" />
				</View>
			);

		const search_nav_items = [
			{
				title: 'Products',
				onPress: () => {
					if (this.state.items_type !== 'products') {
						const list_bkp_data = { list: this.state.list, list_full: this.state.list_full }
						const list_data = { list: this.state.list_bkp_data.list, list_full: this.state.list_bkp_data.list_full }
						this.setState({ search_nav_visible: false, items_type: 'products', ...list_data, list_bkp_data })
					} else {
						this.setState({ search_nav_visible: false })
					}
				},
			},
			{
				title: 'Events',
				onPress: () => {
					if (this.state.items_type !== 'events') {
						const list_bkp_data = { list: this.state.list, list_full: this.state.list_full }
						const list_data = { list: this.state.list_bkp_data.list, list_full: this.state.list_bkp_data.list_full }
						this.setState({ search_nav_visible: false, items_type: 'events', ...list_data, list_bkp_data })
					} else {
						this.setState({ search_nav_visible: false })
					}
				},
			},
			{
				title: 'Cancel',
				onPress: () => this.setState({ search_nav_visible: false }),
			},
		];

		return (
			<View style={{ flex: 1 }}>

				{(this.props.route.params.showing == 'search_results') &&
					<View style={styles.text_input_form}>
						<Text style={styles.input_label}>Showing search results for:</Text>

						<View style={{
							flexDirection: 'row',
							padding: 10,
							backgroundColor: 'white',
							borderRadius: 25,
							shadowOffset: { width: 0, height: 0 },
							shadowColor: 'black',
							shadowOpacity: 0.2,
							elevation: 1,
							marginTop: 10,
							alignItems: 'center'
						}}>
							<Ionicons name="ios-search" size={20} style={{ marginRight: 10 }} />
							<TextInput
								underlineColorAndroid="transparent"
								placeholder="Find Products or Events"
								placeholderTextColor="grey"
								style={{ flex: 1, backgroundColor: 'white', color: '#000' }}
								clearButtonMode="always"
								autoCapitalize="none"
								onChangeText={query_string => this.handleInputChange('query_string', query_string)}
								onSubmitEditing={() => {
									const query_string = this.state.input.query_string + ""
									if (query_string) {
										if (!this.working) {
											this.setState({ list: [], list_loaded: false })
											this.initialFetch()
										}
									}
								}}
								value={this.state.input.query_string + ""}
							/>
						</View>
					</View>
				}

				<FlatList
					data={this.state.list}
					extraData={this.state}
					keyExtractor={(item, key) => key.toString()}
					initialNumToRender={this.state.items_type == "products" ? 6 : 10}
					maxToRenderPerBatch={this.state.items_type == "products" ? 6 : 10}
					windowSize={this.state.items_type == "products" ? 6 : 10}
					refreshing={this.state.list_refreshing}
					onRefresh={(this.initialFetch) ? () => this.initialFetch() : () => { }}
					onEndReached={(this.nextFetch) ? () => this.nextFetch() : () => { }}
					onEndReachedThreshold={0.5}
					numColumns={2}
					columnWrapperStyle={{
						flexWrap: 'wrap',
						paddingTop: 10,
						paddingHorizontal: 10,
						flex: 1,
						justifyContent: 'space-between'
					}}
					ListFooterComponent={<ListFooterComponent />}
					ListEmptyComponent={(this.state.list_loaded) ? <ListEmptyComponent /> : null}
					renderItem={({ item }) => {
						if (this.state.items_type == "products") {
							let product = null;
							if (this.props.route.params.showing == "favourites") {
								const pin = new Pin(item);
								product = pin.item;
							} else {
								product = new Product(item);
							}
							let nav_context = ''
							switch (this.props.route.params.showing) {
								case 'admin_products_action_list': nav_context = 'admin_area'; break;
								case 'from_seller_all': nav_context = 'seller_area'; break;
							}
							return (
								<ProductLoopComponent
									product={product}
									local_pins={this.props.local_pins}
									nav_context={nav_context}
									auth_user={this.props.auth_user}
									onPress={() => this.openSingleItemScreen(product, 'ProductCartViewScreen', { title: product.name, nav_context })}
								/>
							);
						}

						if (this.state.items_type == "events") {
							const event = new SEvent(item);
							return (
								<View style={{ width: width - 20 }} >
									<EventLoopComponent
										event={event}
										onPress={() => this.openSingleItemScreen(event, 'EventViewEditScreen', { title: event.title, screen_mode: "view_existing" })}
									/>
								</View>
							);
						}
						return null
					}}
				/>

				{(this.props.route.params.showing == 'events' && this.props.auth_user && this.props.auth_user.is_active_admin) ?
					<FAB title="Add new" buttonStyle={{ borderRadius: 100, backgroundColor: '#E9446A' }} placement={"right"} onPress={() => this.props.navigation.navigate('EventViewEditScreen', { title: 'New event', screen_mode: 'create_new' })} />
					: null}

				{(this.props.route.params.showing == 'from_seller_all') ?
					<FAB title="Add new" buttonStyle={{ borderRadius: 100, backgroundColor: '#E9446A' }} placement={"right"} onPress={() => this.props.navigation.navigate('ProductEditScreen')} />
					: null}

				{(this.props.route.params.showing == 'search_results') && (
					<>
						{(this.state.list_bkp_data.list.length) ?
							<FAB title="More" buttonStyle={{ borderRadius: 100, backgroundColor: '#E9446A' }} placement={"right"} onPress={() => this.setState({ search_nav_visible: !this.state.search_nav_visible })} />
							: null}
						<BottomSheet
							isVisible={this.state.search_nav_visible}
							containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}
						>
							{search_nav_items.map((l, i) => (
								<ListItem key={i} containerStyle={{ backgroundColor: (this.state.items_type == l.title.toLowerCase()) ? '#eee' : 'white' }} onPress={l.onPress}>
									<ListItem.Content>
										<ListItem.Title style={l.titleStyle}>{l.title}</ListItem.Title>
									</ListItem.Content>
								</ListItem>
							))}
						</BottomSheet>
					</>
				)}
			</View>
		);
	}
}

const mapStateToProps = (state) => {
	/*let local_pinned_favourite_products = [];
	state.local_pins_collection.data.forEach((element) => {
		if (element.pin_type == 'favourite') local_pinned_favourite_products.push(new Pin(element));
	});*/

	const local_pins = []
	state.local_pins_collection.data.forEach((element) => {
		if (element.pin_type == 'favourite') local_pins.push(new Pin(element));
	});

	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data, ['cart', 'pinned_favourite_products', 'store_owned']) : null,
		//local_pinned_favourite_products,
		local_pins,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		placeholder: () => dispatch({ type: 'placeholder' })
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsEventsListScreen);

const styles = StyleSheet.create({
	text_input_form: {
		margin: 20,
	},
	input_label: {
		color: '#8A8F9E',
		textTransform: 'uppercase',
		fontSize: 10
	},
	input_field: {
		borderBottomColor: '#8A8F9E',
		borderBottomWidth: StyleSheet.hairlineWidth,
		color: '#161F3D',
		fontSize: 15,
		height: 35
	}
});
