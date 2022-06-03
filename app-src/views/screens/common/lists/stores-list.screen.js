import React from 'react';
import { connect } from 'react-redux';
import RnBgTask from 'react-native-bg-thread';

import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Button, Overlay, FAB } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Store, User } from '../../../../controller/index';

import StoreLoopComponent from '../../../components/loop-components/store-loop.component';
import ListEmptyComponent from '../../../components/list-empty.component';

class StoresListScreen extends React.Component {

	working = false

	state = {
		modal_visible : false,
		list: [],
		list_loaded: false,
		list_full: false,
		list_refreshing: false,
	};

	openSingleItemScreen(focused_element, screen, screen_params = {}) {
		const focused_store = (focused_element instanceof Store) ? focused_element : null
		this.props.navigation.navigate(screen, { ...screen_params, focused_store })
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

	componentDidMount() {
		this.initialFetch = async (show_list_refreshing_loader = true) => {
			this.setState({ list_refreshing: show_list_refreshing_loader, items_type: "stores" });
			await this.universalGetAll(Store, 'stores_loaded')
			if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
		};
		this.nextFetch = () => this.universalGetAll(Store, 'stores_loaded', 'next');
		this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
			const bgTask = () => this.initialFetch(false)
			try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
		});
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

		return (
			<View style={{ flex: 1 }}>
				<FlatList
					data={this.state.list}
					keyExtractor={(item, key) => key.toString()}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					refreshing={this.state.list_refreshing}
					onRefresh={(this.initialFetch) ? () => this.initialFetch() : () => { }}
					onEndReached={(this.nextFetch) ? () => this.nextFetch() : () => { }}
					onEndReachedThreshold={0.5}
					ListFooterComponent={<ListFooterComponent />}
					ListEmptyComponent={(this.state.list_loaded) ? <ListEmptyComponent /> : null}
					renderItem={({ item }) => {
						const store = new Store(item)
						return (
							<StoreLoopComponent
								store={store}
								onPress={() => this.openSingleItemScreen(store, "ProductsEventsListScreen", { showing: "items_from_store", title: store.name })}
							/>
						)
					}}
				/>

				<Overlay
					animationType="fade"
					isVisible={this.state.modal_visible}
					fullScreen={true}
				>
					<View style={{ margin: -10, flex: 1 }}>
						<View
							style={{
								height: 50,
								flexDirection: "row",
								backgroundColor: "#ccc",
							}}
						>
							<View
								style={{
									justifyContent: "center",
									alignItems: "center",
									flex: 10,
									marginRight: -40
								}}
							>
								<Text style={{ fontWeight: "bold", fontSize: 20 }}>
									Create New Store
								</Text>
							</View>
							<View
								style={{
									justifyContent: "center",
									flex: 1,
									marginRight: 10
								}}
							>
								<Button
									type="outline"
									buttonStyle={{ borderColor: "black" }}
									icon={
										<Ionicons
											name="ios-close"
											size={25}
											color="black"
										/>
									}
									onPress={() => {
										this.setState({ modal_visible: false })
									}}
								/>
							</View>
						</View>
					</View>
				</Overlay>

				{(this.props.auth_user && this.props.auth_user.is_active_admin) ?
					<FAB title="Create New" buttonStyle={{ borderRadius: 100, backgroundColor: '#E9446A' }} placement={"right"} onPress={() => this.setState({modal_visible:true}) } />
					: null}
			</View>
		);
	}
}

const mapStateToProps = (state) => {

	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data) : null,
		stores_resource: state.stores_resource,
	};
};

export default connect(mapStateToProps)(StoresListScreen);