import React, { Component } from 'react';
import { connect } from 'react-redux';
import RnBgTask from 'react-native-bg-thread';

import { View, ActivityIndicator, FlatList } from 'react-native';

import { User, Product, Order, Pin } from '../../../../controller/index';

import CartPinLoopComponent from '../../../components/loop-components/cart-pin-loop.component';
import OrderLoopComponent from '../../../components/loop-components/order-loop.component';
import ListEmptyComponent from '../../../components/list-empty.component';

class OrdersCartListScreen extends Component {

    state = {
        cart_pins_loaded: false,
        user_placed_orders_loaded: false,
        seller_received_orders_loaded: false,

        list: [],
        list_loaded: false,
        list_full: false,
        list_refreshing: false,
        backup_list: [],
    };

    openSingleItemScreen(focused_element, screen, screen_params = {}) {
        const focused_product = (focused_element instanceof Product) ? focused_element : null
        const focused_order = (focused_element instanceof Order) ? focused_element : null
        this.props.navigation.navigate(screen, { ...screen_params, focused_product, focused_order })
    }

    async universalGetAll(Type, indicator_var_name, pagination = null, get_all_params = null, to_backup_list = false) {
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

                            if (to_backup_list) {
                                this.setState({ backup_list: update_object });
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
            case 'cart_pins':
                this.initialFetch = () => {
                    setTimeout(async () => {
                        const user = this.props.auth_user
                        const list =
                            user
                                ? user.cart.pins
                                : this.props.local_pinned_cart_products;
                        this.setState({ cart_pins_loaded: true, list_loaded: true, list, list_full: true });
                    }, 0);
                };
                this.nextFetch = () => { };
                this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => this.initialFetch());
                break;

            case 'user_placed_orders':
                this.initialFetch = async (show_list_refreshing_loader = true) => {
                    if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
                    await this.universalGetAll(Order, 'user_placed_orders_loaded', null, { indexer: 'user_placed_orders', placer_user_id: this.props.auth_user.id })
                    if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
                };
                this.nextFetch = () => this.universalGetAll(Order, 'user_placed_orders_loaded', 'next', { indexer: 'user_placed_orders', placer_user_id: this.props.auth_user.id });
                this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
                    const bgTask = () => this.initialFetch(false)
                    try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
                });
                break;

            case 'seller_received_orders':
                const seller_table = this.props.auth_user.owns_store ? 'stores' : 'users'
                const seller_id = this.props.auth_user.owns_store ? this.props.auth_user.store_owned.id : this.props.auth_user.id
                this.initialFetch = async (show_list_refreshing_loader = true) => {
                    if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
                    await this.universalGetAll(Order, 'seller_received_orders_loaded', null, { indexer: 'seller_received_orders', seller_table, seller_id })
                    if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
                };
                this.nextFetch = () => this.universalGetAll(Order, 'seller_received_orders_loaded', 'next', { indexer: 'seller_received_orders', seller_table, seller_id });
                this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
                    const bgTask = () => this.initialFetch(false)
                    try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
                });
                break;

            case 'admin_orders_management_list':
                this.initialFetch = async (show_list_refreshing_loader = true) => {
                    if (show_list_refreshing_loader) this.setState({ list_refreshing: true });
                    await this.universalGetAll(Order, 'admin_orders_management_list_loaded', null, { indexer: 'admin_orders_management_list' })
                    if (show_list_refreshing_loader) this.setState({ list_refreshing: false })
                };
                this.nextFetch = () => this.universalGetAll(Order, 'admin_orders_management_list_loaded', 'next', { indexer: 'admin_orders_management_list' });
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

        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={this.state.list}
                    extraData={this.state}
                    keyExtractor={(item, key) => key.toString()}
                    initialNumToRender={7}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    refreshing={this.state.list_refreshing}
                    onRefresh={(this.initialFetch) ? () => this.initialFetch() : () => { }}
                    onEndReached={(this.nextFetch) ? () => this.nextFetch() : () => { }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={<ListFooterComponent />}
                    ListEmptyComponent={(this.state.list_loaded) ? <ListEmptyComponent /> : null}
                    renderItem={({ item }) => {
                        if (this.state.cart_pins_loaded) {
                            const cart_pin = new Pin(item)
                            return (
                                <CartPinLoopComponent
                                    cart_pin={cart_pin}
                                    onPress={() => this.openSingleItemScreen(cart_pin.item, 'ProductCartViewScreen', { title: cart_pin.item.name })}
                                />
                            );
                        }

                        if (this.state.user_placed_orders_loaded || this.state.seller_received_orders_loaded || this.state.admin_orders_management_list_loaded) {
                            const order = new Order(item)
                            return (
                                <OrderLoopComponent
                                    order={order}
                                    onPress={() => this.openSingleItemScreen(order, 'OrderViewEditScreen', { title: 'Order ref ' + order.reference })}
                                />
                            );
                        }
                        return null
                    }}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    let local_pinned_cart_products = [];
    state.local_pins_collection.data.forEach((element) => {
        if (element.pin_type == 'cart') local_pinned_cart_products.push(new Pin(element));
    });

    return {
        auth_user: state.auth_user_data ? new User(state.auth_user_data, ['cart', 'store_owned']) : null,
        local_pinned_cart_products,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(OrdersCartListScreen);
