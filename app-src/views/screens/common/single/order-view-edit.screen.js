import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash'

import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import RBSheet from "react-native-raw-bottom-sheet";
import DateTimePicker from 'react-native-date-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from "react-native-elements";
import { ProgressBar } from 'react-native-paper';

import CustomKeyboardAvoidingView from '../../../components/custom-keyboard-avoiding-view.component';

import { Order, User, Input, flashMessage, SDate, SDateTime, images_update_object_params } from '../../../../controller/index';

const progressBarColors = (status) => {
    var color = '#1FB448'
    switch (status) {
        case 'cancelled': color = 'red'; break;
        case 'completed': color = 'blue'; break;
        default: color = '#1FB448'; break;
    }
    return color
}

class OrderViewEditScreen extends React.Component {

    state = {
        working: false,
        focused_order: null,
        focused_order_read: false,
        input: {
            delivery_fee: new Input(),
            utc_offset: null,
            estimated_delivery_datetime: new SDateTime(),
            estimated_delivery_date: new Date(),
            estimated_delivery_time: new Date(),
        },
        date_time_picker_mode: 'date',
        date_time_picker_visible: false,
        errors: [],
    }

    handleInputChange(field, value, use_as_is = false) {
        let input = this.state.input
        input[field] = (use_as_is) ? value : new Input(value)
        //if (this.state.date_time_picker_visible && this.date_time_picker_bottom_sheet)
        //this.date_time_picker_bottom_sheet.close()
        this.setState({ input, date_time_picker_visible: false })
    }

    load_images_rn(action) {
        let options = {
            maxHeight: 1000,
            maxWidth: 1000,
            selectionLimit: 1,
            mediaType: 'photo',
            includeBase64: false,
        }
        let callbackAction = (results) => {
            if (!results.didCancel && results.assets) {
                this.handleInputChange('post_payment_receipt', { ...results.assets[0], name: results.assets[0].fileName }, true)
            }
        }
        if (action == 'pick_images') {
            this.setState({ working: true, picking_images: true });
            ImagePicker.launchImageLibrary(options, callbackAction);
        } else {
            this.setState({ working: true, capturing_images: true })
            ImagePicker.launchCamera(options, callbackAction);
        }
        this.setState({ working: false, picking_images: false, capturing_images: false });
    }

    async load_images(action) {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: false,
        }
        const callbackAction = (result) => {
            if (result && !result.cancelled) {
                this.handleInputChange('post_payment_receipt', { ...result, name: result.uri.split('/').slice(-1)[0] }, true)
            } else { this.setState({ working: false, picking_images: false, capturing_images: false }); }
        }
        let result = null
        if (action == 'pick_images') {
            const media_library_permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (media_library_permissions.status !== 'granted') {
                alert('Enable access to Media Library to continue');
                return;
            }
            this.setState({ working: true, picking_images: true });
            result = await ImagePicker.launchImageLibraryAsync(options);
        } else {
            const camera_permissions = await ImagePicker.requestCameraPermissionsAsync();
            if (camera_permissions.status !== 'granted') {
                alert('Enable access to the Camera to continue');
                return;
            }
            this.setState({ working: true, capturing_images: true })
            result = await ImagePicker.launchCameraAsync(options);
        }
        callbackAction(result)
    }

    handleSubmit = async () => {
        this.setState({ working: true })
        let errors = []
        let { input } = this.state
        if (this.state.focused_order.product.added_by_auth_user) {
            if (!input.delivery_fee.isValid('number', 100, 999999999)) {
                errors.push("Invalid Delivery Fee")
            }
            input.status = 'delivery_fee_set'
        }

        if (errors.length === 0) {
            this.setState({ errors }) // Remove red lines under text inputs
            let _input = _.cloneDeep(input) // Dereference Input instance
            Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = isNumeric(_input[key] + "") ? parseInt(_input[key]) : _input[key] + "" }) // convert Input instances to Text and Numbers

            let images_update_object = JSON.parse(JSON.stringify(images_update_object_params))

            if (this.state.focused_order.product.added_by_auth_user) {
                images_update_object = null
                const _time = !_input.utc_offset ? new Date('2021-08-27T00:00:00.000000Z') : _input.estimated_delivery_time
                _input.estimated_delivery_datetime = _input.estimated_delivery_date.toISOString().split('T')[0] + " " + _time.toISOString().split('T')[1].split('.')[0]
            } else {
                _input.post_payment_receipt.uri = _input.post_payment_receipt.uri.replace(WEB_URL, '')

                if (this.state.focused_order.post_payment_receipt) {
                    if (_input.post_payment_receipt.id !== this.state.focused_order.post_payment_receipt.id) {
                        images_update_object.new_images_to_upload.push(_input.post_payment_receipt)
                        images_update_object.images_to_refresh_in_db.push(this.state.focused_order.post_payment_receipt)
                        images_update_object.old_images_to_delete_from_storage.push(this.state.focused_order.post_payment_receipt)
                    }
                } else {
                    images_update_object.new_images_to_upload.push(_input.post_payment_receipt)
                }
            }
            this.state.focused_order.update(_input, images_update_object).then((response) => {
                this.props.flashMessage({ duration: 4000, message: "Details Updated" })
                this.setNewFocusedElement(new Order(response))
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

    setNewFocusedElement = (focused_order, complete = true) => {
        this.props.navigation.setParams({ title: focused_order.product.name, focused_order });
        this.loadFocusedElement(complete);
    };

    loadFocusedElement = (complete = false) => {
        setTimeout(async () => {
            if (this.props.route.params) {
                const focused_order = this.props.route.params.focused_order;
                this.setState({ focused_order, focused_order_read: false })
                if (!complete) {
                    let found = true
                    await focused_order.read().catch((error) => { found = false; this.props.navigation.goBack(); this.props.flashMessage({ duration: 3000, message: error.message }); })
                    if (!found) return
                }
                let update_object = { focused_order_read: true }
                update_object.working = false
                this.setState(update_object);
            }
        }, 0);
    };

    componentDidMount() {
        this.loadFocusedElement()
    }

    render() {

        const focused_order = this.state.focused_order;

        //const translated_variations = (this.state.focused_order_read) ? this.translated_variations() : [];

        if (!focused_order || !this.state.focused_order_read) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#E9446A" />
                </View>
            );
        }

        const auth_user = this.props.auth_user

        const payment_methods = {
            cash: { icon: 'cash-outline', label: 'Cash' },
            post_cheque: { icon: 'wallet-outline', label: 'Algerie poste cheque' },
            post_transfer: { icon: 'card-outline', label: 'Algerie poste transfer' },
        }

        const should_show_delivery_update_components = (focused_order.product.added_by_auth_user && !(focused_order.delivery_fee > 0) && !focused_order.estimated_delivery_datetime && focused_order.status !== 'cancelled')

        /*const Date_time_picker_bottom_sheet_content = !should_show_delivery_update_components ? () => <></> : () => <View style={{ flex: 1, justifyContent: 'center' }}>
            {(this.state.date_time_picker_visible) && <DateTimePicker
                testID="dateTimePicker"
                value={this.state.input['estimated_delivery_' + this.state.date_time_picker_mode]}
                mode={this.state.date_time_picker_mode}
                display={Platform.OS == 'ios' ? "spinner" : 'default'}
                is24Hour={true}
                display="default"
                onChange={(event, datetime) => {
                    if (datetime) {
                        this.handleInputChange('estimated_delivery_' + this.state.date_time_picker_mode, datetime, true);
                        if (this.state.date_time_picker_mode == 'time')
                            this.handleInputChange('utc_offset', SDate.timezoneUTCOffset(), true);
                    } else {
                        if (this.date_time_picker_bottom_sheet)
                            this.date_time_picker_bottom_sheet.close();
                        this.setState({ date_time_picker_visible: false })
                    }
                }}
            />}
        </View>*/

        return (
            <CustomKeyboardAvoidingView>
                <View testID='orderScreenContainer' style={{ marginHorizontal: 15, marginBottom: 15 }}>
                    <View testID='productSection' style={{ paddingHorizontal: 10, marginTop: 10, flex: 1, backgroundColor: '#fff', paddingBottom: 20 }}>
                        <Text testID='productDetailsHeader' style={{ marginTop: 15, marginBottom: 5, fontSize: 18, fontWeight: 'bold', color: '#000' }}>Product details</Text>

                        <View style={{ flexDirection: 'row' }}>
                            <Image source={focused_order.product.images[0]} style={{ height: 120, width: 120, marginTop: 10, marginRight: 10 }} />
                            <View style={{ flex: 1 }}>
                                <View style={{ paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='productName' style={{ fontSize: 16, fontWeight: 'bold' }}>Product name:</Text><Text style={{ fontSize: 16, flex: 1, textAlign: 'right' }} > {focused_order.product.name}</Text></View>
                                <View style={{ paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='productPrice' style={{ fontSize: 16, fontWeight: 'bold' }}>Price:</Text><Text style={{ fontSize: 16 }} > {priceString(focused_order.product.price)}</Text></View>
                                <View style={{ paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='productQuantity' style={{ fontSize: 16, fontWeight: 'bold' }}>Quantity:</Text><Text style={{ fontSize: 16 }} > {focused_order.product_count}</Text></View>
                                {auth_user.is_active_admin && <View style={{ paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='sellerName' style={{ fontSize: 16, fontWeight: 'bold' }}>Seller:</Text><Text style={{ fontSize: 16, flex: 1, textAlign: 'right' }} > {focused_order.product.seller.name}</Text></View>}
                                <View style={{ paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='sellerLocation' style={{ fontSize: 16, fontWeight: 'bold' }}>Location:</Text><Text style={{ fontSize: 16, flex: 1, textAlign: 'right' }} > {focused_order.product.commune} - {focused_order.product.wilaya}</Text></View>
                            </View>
                        </View>

                    </View>
                    <View testID='orderSection' style={{ paddingHorizontal: 10, marginTop: 10, flex: 1, backgroundColor: '#fff', paddingBottom: 20 }}>

                        <Text testID='orderDetailsHeader' style={{ marginTop: 15, marginBottom: 5, fontSize: 18, fontWeight: 'bold', color: '#000' }}>Order details</Text>
                        <ProgressBar testID='progressBar' progress={focused_order.progress} color={progressBarColors(focused_order.status)} style={{ marginTop: 10, marginBottom: 10, borderRadius: 20 }} />
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='orderPlacement' style={{ fontSize: 16, fontWeight: 'bold' }}>Placed:</Text><Text style={{ fontSize: 16 }} >{ucfirst(focused_order.placed_datetime.prettyDatetime())}</Text></View>
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontSize: 16, fontWeight: 'bold' }}>Receiver:</Text><Text style={{ fontSize: 16 }} >{focused_order.delivery_address.surname + ' ' + focused_order.delivery_address.name_s}</Text></View>
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='fullAddress' style={{ fontSize: 16, fontWeight: 'bold' }}>Delivery address:</Text><Text style={{ fontSize: 16, flex: 1, textAlign: 'right' }} >{ucfirst(focused_order.delivery_address.address_line_one)}, {focused_order.delivery_address.address_line_two ? ucfirst(focused_order.delivery_address.address_line_two + ', ') : ''}{ucfirst(focused_order.delivery_address.commune)}, {ucfirst(focused_order.delivery_address.wilaya)}</Text></View>
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='phoneNo' style={{ fontSize: 16, fontWeight: 'bold' }}>Phone number:</Text><Text style={{ fontSize: 16 }} >+{focused_order.delivery_phone.country_code}{focused_order.delivery_phone.number}</Text></View>
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='deliveryFee' style={{ fontSize: 16, fontWeight: 'bold' }}>Delivery fee:</Text><Text style={{ fontSize: 16 }} > {focused_order.progress > 0.33 ? priceString(focused_order.delivery_fee) : 'to be confirmed shortly'}</Text></View>
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='discountCode' style={{ fontSize: 16, fontWeight: 'bold' }}>Discount:</Text><Text style={{ fontSize: 16 }} > {focused_order.discount_amount ? priceString(focused_order.discount_amount) : 'N/A'}</Text></View>
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='totalAmount' style={{ fontSize: 16, fontWeight: 'bold' }}>Total to be paid:</Text><Text style={{ fontSize: 16 }} > {focused_order.progress > 0.33 ? priceString(focused_order.amount_due_final) : priceString(focused_order.amount_due_provisional) + " (awaiting delivery fee)"}</Text></View>
                        <View style={{ paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='deliveryDate' style={{ fontSize: 16, fontWeight: 'bold' }}>Estimated delivery date:</Text><Text style={{ fontSize: 16, flex: 1, textAlign: 'right' }} > {focused_order.progress > 0.33 && focused_order.estimated_delivery_datetime ? ucfirst(focused_order.estimated_delivery_datetime.prettyDatetime()) : 'To be confirmed shortly'}</Text></View>
                        <View style={{ paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}><Text testID='paymentMethod' style={{ fontSize: 16, fontWeight: 'bold' }}>Payment date:</Text><Text style={{ fontSize: 16 }} > {focused_order.payment_method == "cash" ? "Cash " + (focused_order.status !== 'completed' ? 'to be ' : '') + "paid on delivery" : (focused_order.progress > 0.5 ? focused_order.payment_made_datetime : 'awaiting')}</Text></View>

                    </View>

                    <View testID='paymentSection' style={{ paddingHorizontal: 10, marginTop: 10, flex: 1, backgroundColor: '#fff', paddingBottom: 20 }}>
                        <Text testID='paymentDetailsHeader' style={{ marginTop: 15, marginBottom: 25, fontSize: 18, fontWeight: 'bold', color: '#000' }}>Payment details</Text>
                        {focused_order.payment_method === 'cash' &&
                            <Text testID='paymentType'>Cash {focused_order.status !== 'completed' ? 'to be ' : ''}paid on delivery</Text>
                        }
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            {focused_order.payment_method !== 'cash' &&
                                <Image testID='paymentImage' source={focused_order.post_payment_receipt ? focused_order.post_payment_receipt : require('../../../../assets/general-img/jk-placeholder-image.jpg')} style={{ height: 100, width: 100, marginRight: 10 }} />
                            }
                            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                {!focused_order.product.added_by_auth_user && focused_order.status == 'delivery_fee_set' && focused_order.payment_method !== 'cash' && <>
                                    <TouchableOpacity testID='paymentProofUpload'
                                        style={styles.uploadPaymentDetailsButton}
                                        disabled={this.state.working}
                                        onPress={() => this.image_picker_bottom_sheet.open()}
                                    >
                                        <Text style={styles.uploadPaymentDetailsButtonText} >
                                            Upload Payment Details
                                        </Text>
                                    </TouchableOpacity>

                                    <RBSheet
                                        ref={ref => { this.image_picker_bottom_sheet = ref; }}
                                        height={250}
                                        openDuration={250}
                                        closeOnDragDown
                                        closeDuration={20}
                                        customStyles={{ container: { paddingHorizontal: 20, borderTopRightRadius: 20, borderTopLeftRadius: 20 } }}
                                    >
                                        <View>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', paddingBottom: 20, paddingTop: 10, textAlign: 'center' }}>Add Image(s)</Text>
                                            <View style={{ borderBottomColor: '#ccc', borderBottomWidth: StyleSheet.hairlineWidth }} ></View>
                                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 15 }}
                                                onPress={() => {
                                                    this.image_picker_bottom_sheet.close()
                                                    setTimeout(() => {
                                                        this.load_images('pick_images');
                                                    }, 100)
                                                }}
                                            >
                                                <Ionicons name="ios-images" size={30} style={{ flex: 1 }} color={'#777'} />
                                                <Text style={{ fontSize: 14, flex: 5, color: '#777' }}>Choose From Gallery</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 15 }}
                                                onPress={() => {
                                                    this.image_picker_bottom_sheet.close()
                                                    setTimeout(() => {
                                                        this.load_images('open_camera');
                                                    }, 100)
                                                }}
                                            >
                                                <Ionicons name="ios-camera" size={35} style={{ flex: 1 }} color={'#777'} />
                                                <Text style={{ fontSize: 14, flex: 5, color: '#777' }}>Take Photo</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </RBSheet>
                                </>}
                            </View>
                        </View>

                        {(this.state.errors && this.state.errors.length) ? (
                            <View style={styles.errors_field}>
                                {this.state.errors.map((error, key) => (
                                    <Text key={key} style={styles.error}>• {error}</Text>
                                ))}
                            </View>
                        ) : null}

                        {auth_user.is_active_admin && focused_order.payment_method !== 'cash' && focused_order.status == 'payment_made' &&
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity testID='paymentConfirmationButton'
                                    style={styles.saveUpdatedButton}
                                    disabled={this.state.working}
                                    onPress={() => {
                                        Alert.alert(
                                            'Confirm',
                                            'Confirm payment',
                                            [
                                                { text: 'No', onPress: () => { }, style: 'cancel' },
                                                {
                                                    text: 'Yes',
                                                    onPress: () => {
                                                        this.setState({ working: true })
                                                        focused_order.update({ status: 'payment_confirmed' })
                                                            .then(() => this.props.flashMessage({ duration: 750, message: 'Payment Confirmed' }))
                                                            .catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
                                                            .finally(() => this.setNewFocusedElement(focused_order))
                                                    }
                                                }
                                            ],
                                            { cancelable: true }
                                        );
                                    }}
                                >
                                    <Text testID='paymentConfirmationText' style={styles.saveUpdatedButtonText} >
                                        Confirm payment
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity testID='paymentRejectionButton'
                                    style={styles.cancelOrderButton}
                                    disabled={this.state.working}
                                    onPress={() => {
                                        Alert.alert(
                                            'Confirm',
                                            'Reject payment',
                                            [
                                                { text: 'No', onPress: () => { }, style: 'cancel' },
                                                {
                                                    text: 'Yes',
                                                    onPress: () => {
                                                        this.setState({ working: true })
                                                        focused_order.update({ status: 'delivery_fee_set' })
                                                            .then(() => this.props.flashMessage({ duration: 750, message: 'Payment Details Rejected' }))
                                                            .catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
                                                            .finally(() => this.setNewFocusedElement(focused_order))
                                                    }
                                                }
                                            ],
                                            { cancelable: true }
                                        );
                                    }}
                                >
                                    <Text testID='paymentRejectionText' style={styles.cancelOrderButtonText} >
                                        Reject payment
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }

                        {should_show_delivery_update_components && <>
                            <Text testID='deliveryDetailsHeader' style={{ marginTop: 15, fontSize: 18, fontWeight: 'bold', color: '#000' }}>Delivery Details</Text>
                            <View style={styles.text_input_form}>
                                <Text style={styles.input_label}>Delivery Fee</Text>
                                <TextInput testID='deliveryFeeField' style={{ ...styles.input_field, paddingLeft: 35, borderBottomColor: this.state.input.delivery_fee.hasError() ? 'red' : styles.input_field.borderBottomColor }}
                                    keyboardType="phone-pad"
                                    autoCapitalize="none"
                                    maxLength={12}
                                    onChangeText={delivery_fee => this.handleInputChange('delivery_fee', delivery_fee.replace(/\D/g, ''))}
                                    value={(this.state.input.delivery_fee + "") ? parseInt(this.state.input.delivery_fee).toLocaleString() : ""}
                                />
                                <Text testID='currencyType' style={{ position: 'absolute', top: 20, fontSize: 15 }} >DA</Text>
                            </View>

                            <View style={styles.datetime_input_form}>
                                <Text style={styles.input_label}>Delivery Date</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 4 }}>
                                        <Text testID='verifiedDeliveryDate'>{ucfirst((new SDateTime(this.state.input.estimated_delivery_date)).prettyDate())}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Button
                                            testID='deliveryDateButton'
                                            title="Set"
                                            titleStyle={{ color: "#222" }}
                                            type="outline"
                                            TouchableComponent={TouchableOpacity}
                                            buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                            onPress={() => {
                                                //if (Platform.OS == 'ios')
                                                //this.date_time_picker_bottom_sheet.open();
                                                this.setState({ date_time_picker_visible: true, date_time_picker_mode: 'date' })
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.datetime_input_form}>
                                <Text testID='deliveryTime' style={styles.input_label}>Delivery Time (Optional)</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 5 }}>
                                        <Text>{this.state.input.utc_offset ? ucfirst((new SDateTime(this.state.input.estimated_delivery_time)).prettyTime()) + ' (GMT' + this.state.input.utc_offset + ')' : ''}</Text>
                                    </View>
                                    <View style={{ flex: 3 }}>
                                        <Button
                                            testID='unsetDeliveryTimeButton'
                                            title="Unset"
                                            disabled={!this.state.input.utc_offset}
                                            titleStyle={{ color: "#222" }}
                                            type="outline"
                                            TouchableComponent={TouchableOpacity}
                                            buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                            onPress={() => {
                                                this.handleInputChange('utc_offset', null, true)
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <Button
                                            title="Set"
                                            titleStyle={{ color: "#222" }}
                                            type="outline"
                                            TouchableComponent={TouchableOpacity}
                                            buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                            onPress={() => {
                                                //if (Platform.OS == 'ios')
                                                //this.date_time_picker_bottom_sheet.open();
                                                this.setState({ date_time_picker_visible: true, date_time_picker_mode: 'time' })
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                testID='updateButton'
                                style={styles.saveUpdatedButton}
                                disabled={this.state.working}
                                onPress={this.handleSubmit}
                            >
                                {this.state.working ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text testID='updateButtonText' style={styles.saveUpdatedButtonText} >
                                        Update
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </>}

                        <DateTimePicker
                            modal
                            title={null}
                            open={this.state.date_time_picker_visible}
                            mode={this.state.date_time_picker_mode}
                            date={this.state.input['estimated_delivery_' + this.state.date_time_picker_mode]}
                            onConfirm={(datetime) => {
                                this.handleInputChange('estimated_delivery_' + this.state.date_time_picker_mode, datetime, true);
                                if (this.state.date_time_picker_mode == 'time')
                                    this.handleInputChange('utc_offset', SDate.timezoneUTCOffset(), true);
                            }}
                            onCancel={() => {
                                this.setState({ date_time_picker_visible: false })
                            }}
                        />

                        {/*{Platform.OS == 'ios' ? (
                            <RBSheet
                                ref={ref => { this.date_time_picker_bottom_sheet = ref; }}
                                height={250}
                                openDuration={250}
                                closeOnDragDown
                                closeDuration={20}
                                customStyles={{ container: { paddingHorizontal: 20, paddingBottom: 20, borderTopRightRadius: 20, borderTopLeftRadius: 20 } }}
                            >
                                <Date_time_picker_bottom_sheet_content />
                            </RBSheet>
                        ) : <Date_time_picker_bottom_sheet_content />}*/}

                    </View>

                    <View style={{ paddingHorizontal: 10, marginTop: 10, flex: 1, backgroundColor: '#fff', paddingBottom: 20 }}>
                        <Text style={{ marginTop: 15, marginBottom: 25, fontSize: 18, fontWeight: 'bold', color: '#000' }}>Actions</Text>

                        {auth_user.id === focused_order.placer_user_id && ((focused_order.payment_method === 'cash' && focused_order.status === 'delivery_fee_set')
                            || focused_order.payment_method !== 'cash' && focused_order.status === 'payment_confirmed') ?
                            <TouchableOpacity
                                style={styles.cancelOrderButton}
                                disabled={this.state.working}
                                onPress={() => {
                                    Alert.alert(
                                        'Confirm',
                                        'Confirm order delivery',
                                        [
                                            { text: 'No', onPress: () => { }, style: 'cancel' },
                                            {
                                                text: 'Yes',
                                                onPress: () => {
                                                    this.setState({ working: true })
                                                    focused_order.update({ status: 'delivered' })
                                                        .then((response) => { this.props.flashMessage({ duration: 750, message: 'Delivery confirmed' }); this.setNewFocusedElement(new Order(response)) })
                                                        .catch((error) => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
                                                }
                                            }
                                        ],
                                        { cancelable: true }
                                    );
                                }}
                            >
                                {this.state.working ? <ActivityIndicator color="#fff" /> :
                                    <Text style={styles.cancelOrderButtonText} >Confirm Delivery</Text>
                                }
                            </TouchableOpacity>
                            : <></>
                        }

                        {!['cancelled', 'delivered', 'completed'].includes(focused_order.status) &&
                            <TouchableOpacity
                                testID='cancelOrderButton'
                                style={styles.cancelOrderButton}
                                disabled={this.state.working}
                                onPress={() => {
                                    Alert.alert(
                                        'Confirm',
                                        'Cancel order',
                                        [
                                            { text: 'No', onPress: () => { }, style: 'cancel' },
                                            {
                                                text: 'Yes',
                                                onPress: () => {
                                                    this.setState({ working: true })
                                                    focused_order.update({ status: 'cancelled' })
                                                        .then((response) => { this.props.flashMessage({ duration: 750, message: 'Order Cancelled' }); this.setNewFocusedElement(new Order(response)) })
                                                        .catch((error) => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
                                                }
                                            }
                                        ],
                                        { cancelable: true }
                                    );
                                }}
                            >
                                {this.state.working ? <ActivityIndicator color="#fff" /> :
                                    <Text testID='cancelOrderButtonText' style={styles.cancelOrderButtonText} >Cancel order</Text>
                                }
                            </TouchableOpacity>
                        }

                        {(focused_order.status == 'cancelled') &&
                            <Text testID='orderCancellationStatus' style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: 'red', marginBottom: 10 }}>Order Cancelled</Text>}

                        {(auth_user.is_active_admin && focused_order.status == 'delivered') &&
                            <TouchableOpacity
                                style={styles.cancelOrderButton}
                                disabled={this.state.working}
                                onPress={() => {
                                    Alert.alert(
                                        'Confirm',
                                        'Mark order as completed',
                                        [
                                            { text: 'No', onPress: () => { }, style: 'cancel' },
                                            {
                                                text: 'Yes',
                                                onPress: () => {
                                                    this.setState({ working: true })
                                                    focused_order.update({ status: 'completed' })
                                                        .then((response) => { this.props.flashMessage({ duration: 750, message: 'Order completed' }); this.setNewFocusedElement(new Order(response)) })
                                                        .catch((error) => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
                                                }
                                            }
                                        ],
                                        { cancelable: true }
                                    );
                                }}
                            >
                                {this.state.working ? <ActivityIndicator color="#fff" /> :
                                    <Text testID='cancelOrderButtonText' style={styles.cancelOrderButtonText} >Mark as completed</Text>
                                }
                            </TouchableOpacity>}

                        {['cancelled', 'completed'].includes(focused_order.status) &&
                            <TouchableOpacity
                                style={styles.cancelOrderButton}
                                disabled={this.state.working}
                                onPress={() => {
                                    Alert.alert(
                                        'Confirm',
                                        'Remove order',
                                        [
                                            { text: 'No', onPress: () => { }, style: 'cancel' },
                                            {
                                                text: 'Yes',
                                                onPress: () => {
                                                    this.setState({ working: true })
                                                    let update_object = {}
                                                    if (focused_order.product.added_by_auth_user) {
                                                        update_object.visible_to_seller = false
                                                    }
                                                    if (focused_order.placer_user_id == auth_user.id) {
                                                        update_object.visible_to_placer = false
                                                    }
                                                    if ((auth_user.is_active_admin && focused_order.placer_user_id == focused_order.intermediary_admin_user_id) || (!Object.keys(update_object).length)) {
                                                        update_object.visible_to_admin = false
                                                    }
                                                    focused_order.update(update_object)
                                                        .then(() => { this.props.flashMessage({ duration: 750, message: 'Order Removed' }); this.props.navigation.goBack() })
                                                        .catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
                                                }
                                            }
                                        ],
                                        { cancelable: true }
                                    );
                                }}
                            >
                                {this.state.working ? <ActivityIndicator color="#fff" /> :
                                    <Text style={styles.cancelOrderButtonText} >Remove</Text>
                                }
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </CustomKeyboardAvoidingView>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth_user: state.auth_user_data ? new User(state.auth_user_data) : null,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        flashMessage: (params) => dispatch(flashMessage(params))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderViewEditScreen);

const styles = StyleSheet.create({
    errors_field: {
        paddingTop: 20,
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
    text_input_form: {
        marginBottom: 10,
        marginTop: 20
    },
    datetime_input_form: {
        marginBottom: 10,
        marginTop: 20,
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    dropdown_input_form: {
        marginBottom: 10,
        marginTop: 20,
        flexDirection: "row",
        alignItems: 'center',
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
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
    },
    saveUpdatedButton: {
        flex: 1,
        backgroundColor: '#E9446A',
        borderRadius: 10,
        marginHorizontal: 1,
        height: 40,
        justifyContent: 'center'
    },
    saveUpdatedButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    cancelOrderButton: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 10,
        marginHorizontal: 1,
        height: 40,
        maxHeight: 40,
        justifyContent: 'center'
    },
    cancelOrderButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    uploadPaymentDetailsButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 1,
        height: 40,
        maxHeight: 40,
        justifyContent: 'center'
    },
    uploadPaymentDetailsButtonText: {
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    SetActionButton: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 10,
        marginHorizontal: 1,
        height: 40,
        justifyContent: 'center'
    },
    SetActionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
});
