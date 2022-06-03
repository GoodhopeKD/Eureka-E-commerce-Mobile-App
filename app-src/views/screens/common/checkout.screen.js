import React from 'react';
import { connect } from "react-redux";
import { CommonActions } from '@react-navigation/native';

import { View, StyleSheet, Text, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator, FlatList, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PhonesViewEdit from '../../components/phones-view-edit.component'

import CustomKeyboardAvoidingView from '../../components/custom-keyboard-avoiding-view.component';
import { BottomSheetPicker, PickerOption } from '../../components/bottom-sheet-picker.component';

import { Order, OrderResource, User, flashMessage, AddressResource, PhoneResource, Input } from '../../../controller/index'
import { Icon } from 'react-native-elements/dist/icons/Icon';

class CheckoutScreen extends React.Component {

    state = {
        working: false,
        errors: [],
        auth_requested: false,
        focused_pin: null,
        focused_order: null,
        focused_order_loaded: false,
    }

    async loadPin() {
        if (this.props.route.params) {
            const focused_pin = this.props.route.params.focused_pin
            const auth_user = this.props.auth_user

            const focused_order = new Order(await Order.create({
                ...OrderResource,
                placer_user_id: auth_user.id,
                seller_table: focused_pin.item.seller_table,
                seller_id: focused_pin.item.seller_id,
                product_id: focused_pin.item_id,
                product: focused_pin.item,
                product_count: focused_pin.item_cart_count,
                //product_variations: focused_pin.item_cart_variations,
                delivery_address: this.state.focused_order_loaded ? this.props.focused_order.delivery_address : auth_user.address,
                delivery_phone: this.state.focused_order_loaded ? this.props.focused_order.delivery_phone : auth_user.phones[0],
                //delivery_fee: this.state.focused_order_loaded ? this.props.focused_order.delivery_fee : 1000,
                amount_due_provisional: this.state.focused_order_loaded ? this.props.focused_order.amount_due_provisional : focused_pin.item.price * focused_pin.item_cart_count,
                payment_method: this.state.focused_order_loaded ? this.props.focused_order.payment_method : 'cash',
            }, 'local'))

            const delivery_phone = focused_order.delivery_phone ? focused_order.delivery_phone : { ...PhoneResource, country_code: '213', tag: 'calls_or_whatsapp' }

            this.setState({
                working: false,
                errors: [],
                focused_pin,
                focused_order_loaded: true,
                focused_order,
                input: {
                    number: new Input(delivery_phone.number),
                    tag: delivery_phone.tag,
                    country_code: new Input(delivery_phone.country_code),
                },
            })
        }
    }

    updatePreferredPaymentMethod = payment_method => {
        if (payment_method !== this.state.focused_order.payment_method) {
            this.setState({ working: true })
            this.state.focused_order.update({ payment_method }, null, null, 'local')
                .then(() => this.loadPin())
        }
    }

    triggerLoadPin = () => this.loadPin()

    handleInputChange(field, value, use_as_is = false) {
        let input = this.state.input
        input[field] = (use_as_is) ? value : new Input(value)
        this.setState({ input })
    }

    handleSubmit(input_field_name) {
        this.setState({ working: true })

        let errors = []
        let { input } = this.state

        if (input_field_name == "delivery_phone") {
            if (!input.country_code.isValid('number', 0, 99999)) {
                errors.push("Invalid country code")
            } else {
                input.country_code.overrideError()
            }
            if (!input.number.isValid('number', 0, 999999999999)) {
                errors.push("Invalid number")
            } else {
                input.number.overrideError()
            }

            if (errors.length === 0) {
                this.setState({ errors }) // Remove red lines under text inputs
                let _input = Object.assign(Object.create(Object.getPrototypeOf(input)), input) // Dereference Input instance
                Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = isNumeric(_input[key] + "") ? parseInt(_input[key]) : _input[key] + "" }) // convert Input instances to Text and Numbers

                let callbackAction = () => { }

                const phone_data = { country_code: _input.country_code + "", tag: _input.tag, number: _input.number + "" }

                callbackAction = async () => {
                    await this.state.focused_order.update({ delivery_phone: phone_data }, null, null, 'local')
                    Promise.resolve()
                }

                callbackAction().then(() => {
                    this.props.flashMessage({ duration: 1000, message: "Number Saved" })
                    this.loadPin()
                    this.setState({ working: false })
                }).catch((error) => {
                    if (error.data && error.data.errors) {
                        errors.push(error.data.message)
                        Object.keys(error.data.errors).forEach(key => {
                            error.data.errors[key].forEach(element => {
                                errors.push(element)
                            });
                        })
                    } else if (error.message) {
                        errors.push(error.message)
                    }
                    this.setState({ working: false, errors })
                })
            } else {
                this.setState({ working: false, errors, input })
            }
        }
    }

    handleCheckout = () => {
        this.setState({ working: true })
        const working = false

        let errors = []

        if (!this.state.focused_order.delivery_address) {
            errors.push('Delivery address should be set')
        }

        if (!this.state.focused_order.delivery_phone) {
            errors.push('Delivery phone number should be set')
        }

        if (errors.length === 0) {
            Alert.alert(
                'Confirm checkout',
                'Are you sure you want to checkout?',
                [
                    { text: 'No', onPress: () => this.setState({ working, errors }), style: 'cancel' },
                    {
                        text: 'Yes', onPress: () => Order.create({ ...instanceToResource(this.state.focused_order), amount_due_final: null, }).then((order_rsc) => {
                            this.props.flashMessage({ duration: 2000, message: "Order placed" })
                            const order = new Order(order_rsc)
                            this.props.navigation.dispatch((state) => {
                                const params = { ...state.routes[state.routes.length - 1].params, focused_order: order, title: 'Order ref ' + order.reference };
                                return CommonActions.reset({
                                    index: 1,
                                    routes: [
                                        {
                                            name: 'MainTabsNav', state:
                                            {
                                                routes: [{ name: 'ProfileTab' }]
                                            }
                                        },
                                        { name: 'UserOrdersListScreen' },
                                        { name: 'OrderViewEditScreen', params }
                                    ]
                                });
                            });
                        }).catch((error) => {
                            if (error.data && error.data.errors) {
                                errors.push(error.data.message)
                                Object.keys(error.data.errors).forEach(key => {
                                    error.data.errors[key].forEach(element => {
                                        errors.push(element)
                                    });
                                })
                            } else if (error.message) {
                                errors.push(error.message)
                            }
                            this.setState({ working, errors })
                        })
                    }
                ],
                { cancelable: true }
            )
        } else {
            this.setState({ working, errors })
        }
    }

    componentDidMount = () => {
        if (!this.props.auth_user) {
            if (!this.state.auth_requested) {
                this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => {
                    if (this.state.auth_requested) {
                        setTimeout(() => {
                            if (!this.props.auth_user) {
                                this.props.flashMessage({ duration: 2000, message: "You need to be logged in to complete purchase" })
                                this.props.navigation.goBack()
                            } else {
                                this.loadPin()
                            }
                        }, 0)
                    }
                });
                this.setState({ auth_requested: true })
                this.props.flashMessage({ duration: 2000, message: "Log in to complete purchase" })
                this.props.navigation.navigate("SignInScreen")
                return
            }
        } else {
            this._unsubscribeFocusListener = this.props.navigation.addListener('focus', () => this.loadPin())
        }
    }

    componentWillUnmount() {
        if (this._unsubscribeFocusListener) this._unsubscribeFocusListener();
    }

    render() {

        const auth_user = this.props.auth_user

        if (!auth_user || !this.state.focused_pin) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#E9446A" />
                </View>
            );
        }

        const focused_order = this.state.focused_order

        const items_placeholder = [
            { name: 'one' },
            { name: 'two' },
        ]

        const payment_methods = {
            cash: { icon: 'cash-outline', label: 'Cash' },
            post_cheque: { icon: 'wallet-outline', label: 'Algerie poste cheque' },
            post_transfer: { icon: 'card-outline', label: 'Algerie poste transfer' },
        }

        return (
            <CustomKeyboardAvoidingView scrollview={false}>
                <FlatList
                    testID='checkoutContainer'
                    data={items_placeholder}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, key) => key.toString()}
                    renderItem={({ item }) => {
                        if (item.name == 'one') {
                            return (<View style={{ flex: 1 }}>
                                <View style={{ flex: 1, marginTop: 15, marginHorizontal: 15 }}>
                                    <Ionicons testID='icon' name={payment_methods[focused_order.payment_method].icon} size={25} />
                                    <View style={{ flexDirection: 'row', marginTop: 7, borderBottomColor: '#ccc', borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' }}>
                                        <View style={{ flex: 1 }}><Text testID='paymentOption' style={{ fontSize: 16, fontWeight: 'bold' }}>Payment method:</Text></View>
                                        <BottomSheetPicker
                                            title_label={'Payment method'}
                                            style={{ flex: 1, height: null }}
                                            selected_value={focused_order.payment_method}
                                            selected_label_style={{ fontSize: 16, fontWeight: 'bold' }}
                                            onValueChange={(ItemValue) => this.updatePreferredPaymentMethod(ItemValue)}
                                        >
                                            {Object.keys(payment_methods).map(key => (
                                                <PickerOption key={key} label={payment_methods[key].label} value={key} style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 20 }} >
                                                    <Ionicons name={payment_methods[key].icon} size={30} />
                                                    <Text style={{ fontSize: 20, paddingLeft: 10 }}>{payment_methods[key].label}</Text>
                                                </PickerOption>
                                            ))}
                                        </BottomSheetPicker>
                                    </View>
                                </View>

                                <View testID='orderSummary' style={styles.feedItem}>
                                    <Image testID='orderImage' source={focused_order.product.images[0]} style={styles.icon} />
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <Text testID='orderName' style={styles.productName}>{focused_order.product.name}</Text>
                                            <Text testID='orderPrice' style={styles.copy}>Price: {priceString(focused_order.product.price)}</Text>
                                            {/*focused_order.product_variations && focused_order.product_variations.map((variation, key) =>
                                                <Text key={key} style={styles.copy}>{variation.name + ': ' + variation.value}</Text>
                                            )*/}
                                            <Text testID='orderQuantity' style={styles.copy}>Quantity: {focused_order.product_count}</Text>
                                            {/*<Text style={styles.copy}>Delivery Fee: {priceString(focused_order.delivery_fee)}</Text>*/}
                                            <Text testID='orderFee' style={styles.totalPrice}>Total: {priceString(focused_order.amount_due_provisional)}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginHorizontal: 15, marginTop: 25, marginBottom: 30 }}>
                                    <View style={styles.promoCode}>
                                        <View style={{ flex: 1, marginTop: -25 }}>
                                            <Text style={{ color: '#8A8F9E', fontSize: 14, fontWeight: 'bold' }}>Promo/Student/Coupon code</Text>
                                        </View>
                                        <TextInput
                                            testID='promoCodeText'
                                            autocapitalize='none'
                                            style={{ fontSize: 16 }}
                                        />
                                    </View>
                                    <TouchableOpacity testID='promoCodeButton' style={{ flex: 2 }}>
                                        <View style={{ height: 40, backgroundColor: '#fff', borderWidth: 1, borderRadius: 10, justifyContent: 'center' }}>
                                            <Text style={{ textAlign: 'center', color: '#000', fontWeight: 'bold' }}>Apply</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>)
                        }

                        if (item.name == 'two') {

                            const delivery_address = focused_order.delivery_address ? focused_order.delivery_address : AddressResource

                            return <>
                                <View style={styles.feedItem}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 20, justifyContent: 'space-between' }}>
                                            <Text style={styles.adress}>Delivery details</Text>
                                            <TouchableOpacity testID='editButton' onPress={() => this.props.navigation.navigate('AddressEditScreen', { nav_context: 'checkout-screen', focused_order })}>
                                                <View style={{ width: 90, height: 40, backgroundColor: '#fff', borderWidth: 1, borderRadius: 10, justifyContent: 'center' }}>
                                                    <Text style={{ textAlign: 'center', color: '#000', fontWeight: 'bold' }}>Edit</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <Text testID='fullName' style={styles.reUsable}>{delivery_address.name_s + ' ' + delivery_address.surname}</Text>
                                        <Text testID='delvAd' style={styles.reUsable}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {delivery_address.address_line_one}</Text>
                                        {(delivery_address.address_line_two) ? <Text testID='delvAdAlt' style={styles.reUsable}>{delivery_address.address_line_two}</Text> : null}
                                        <Text testID='postalCd' style={styles.reUsable}><Text style={{ fontWeight: 'bold' }}>Postal Code:</Text> {delivery_address.postal_code}</Text>
                                        <Text testID='communeInfo' style={styles.reUsable}><Text style={{ fontWeight: 'bold' }}>Commune:</Text> {delivery_address.commune}</Text>
                                        <Text testID='wilayaInfo' style={styles.reUsable}><Text style={{ fontWeight: 'bold' }}>Wilaya:</Text> {delivery_address.wilaya}</Text>
                                    </View>
                                </View>

                                <View style={{ marginHorizontal: 15, marginTop: 10, marginBottom: 10 }}>
                                    <View style={{ paddingTop: 20 }}>
                                        <Text style={{ paddingBottom: 10, fontSize: 24, fontWeight: "500" }}>Phone</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text testID='dialingCode' style={{ marginTop: 7, fontSize: 30 }}>🇩🇿</Text>
                                        <Text style={{ marginTop: 15, fontSize: 16, paddingLeft: 3, paddingRight: 5 }}>+213</Text>
                                        {/*<Ionicons name='chevron-down-outline' size={20} style={{ marginTop: Platform.OS === 'android' ? 15 : 13 }} />*/}
                                        <View style={styles.promoCode}>
                                            <TextInput
                                                onChangeText={value => this.handleInputChange('number', value)}
                                                value={(this.state.input.number + "").replace(/^0+/, '')}
                                                testID='phoneNo'
                                                keyboardType={'number-pad'}
                                                autocapitalize='none'
                                                style={{ fontSize: 16 }}
                                            />
                                        </View>
                                        <TouchableOpacity testID='phoneNoButton' style={{ flex: 2 }} onPress={() => this.handleSubmit('delivery_phone')}>
                                            <View style={{ height: 40, backgroundColor: '#fff', borderWidth: 1, borderRadius: 10, justifyContent: 'center' }}>
                                                <Text style={{ textAlign: 'center', color: '#000', fontWeight: 'bold' }}>Save</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/*
                                     <View style={{ marginHorizontal: 15 }}><PhonesViewEdit auth_user={auth_user} navigation={this.props.navigation} nav_context="checkout-screen" focused_order={focused_order} triggerLoadPin={this.triggerLoadPin} /></View>
                                */}
                            </>
                        }
                    }}
                    ListFooterComponent={<>
                        <View style={styles.errors_field}>
                            {this.state.errors.map((error, key) => (
                                <Text key={key} style={styles.error}>• {error}</Text>
                            ))}
                        </View>
                        <View style={{ flex: 1, alignSelf: "center", marginVertical: 20 }}>
                            <TouchableOpacity testID='checkoutButton' onPress={this.handleCheckout} style={styles.checkoutButton}>
                                <Text style={{ fontSize: 17, fontWeight: "500", textAlign: 'center', color: '#fff' }}>Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </>}
                />
            </CustomKeyboardAvoidingView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth_user: (state.auth_user_data) ? new User(state.auth_user_data, ['address', 'phones']) : null,
        focused_order: state.orders_resource.focused
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        flashMessage: (params) => dispatch(flashMessage(params))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutScreen);

const styles = StyleSheet.create({
    errors_field: {
        paddingTop: 20,
        marginHorizontal: 30,
        //textAlign: 'center',
        //alignItems: 'center',
        //justifyContent: 'center'
    },
    error: {
        color: '#E9446A',
        fontSize: 13,
        fontWeight: '600',
        //textAlign: 'center'
    },
    container: {
        flex: 1,
        marginBottom: 25
    },
    header: {
        borderBottomColor: "#dddddd",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 32,
        paddingVertical: 12
    },
    feed: {
        marginHorizontal: 15
    },
    feedItem: {
        backgroundColor: '#FFF',
        padding: 10,
        paddingVertical: 25,
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15,
        flexDirection: "row",
        marginVertical: 8,
        //height: 250
    },
    icon: {
        width: 150,
        height: 180,
        marginRight: 16
    },
    productName: {
        fontSize: 16
    },
    copy: {
        fontSize: 16,
        paddingTop: 7
    },
    adress: {
        fontSize: 24,
        fontWeight: "500",
        //paddingBottom: 25
    },
    reUsable: {
        fontSize: 18,
        paddingBottom: 7
    },
    totalPrice: {
        fontSize: 18,
        paddingTop: 7,
        fontWeight: 'bold'
    },
    promoCode: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#8A8F9E',
        color: '#161F3D',
        flex: 5,
        height: 40,
        paddingTop: 15
    },
    phoneNumber: {
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
        color: '#161F3D',
        fontSize: 15,
        height: 40
    },
    checkoutButton: {
        width: 110,
        height: 50,
        backgroundColor: '#E9446A',
        borderRadius: 10,
        justifyContent: 'center'
    }
});