import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash'

import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Button } from "react-native-elements";
import { SliderBox } from 'react-native-image-slider-box';
import RBSheet from "react-native-raw-bottom-sheet";
import Counter from 'react-native-counters';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomKeyboardAvoidingView from '../../../components/custom-keyboard-avoiding-view.component';
import { BottomSheetPicker, PickerOption } from '../../../components/bottom-sheet-picker.component';

import { Product, User, Input, flashMessage, WEB_URL, images_update_object_params, /*variations_update_object_params*/ } from '../../../../controller/index';

let { width } = Dimensions.get('window');
width = width - 30 * 2;
const height = width;

class ProductEditScreen extends React.Component {

    screen_mode = 'create_new' // edit_existing
    og_focused_product = null

    state = {
        focused_product: null,
        focused_product_read: false,
        working: false,

        submit_confirmed: false,
        input: {
            name: new Input(),
            category_id: 2,
            details: new Input(),
            entry_type: 'product',
            price: new Input(),
            condition: "brand_new",
            commune: new Input((this.props.auth_user.owns_store && this.props.auth_user.store_owned.commune) ? this.props.auth_user.store_owned.commune : (this.props.auth_user.address) ? this.props.auth_user.address.commune : this.props.active_connect_instance_data.request_location && this.props.active_connect_instance_data.request_location.cityName ? (this.props.active_connect_instance_data.request_location.cityName == 'Algiers' ? 'Alger' : this.props.active_connect_instance_data.request_location.cityName) : "Es-Senia"),
            wilaya: (this.props.auth_user.store_owned && this.props.auth_user.store_owned.wilaya) ? this.props.auth_user.store_owned.wilaya : (this.props.auth_user.address) ? this.props.auth_user.address.wilaya : this.props.active_connect_instance_data.request_location && this.props.active_connect_instance_data.request_location.regionName ? (this.props.active_connect_instance_data.request_location.regionName == 'Algiers' ? 'Alger' : this.props.active_connect_instance_data.request_location.regionName) : "Oran",
            images: [],
            //variations: [],
            seller_table: (this.props.auth_user.owns_store) ? 'stores' : 'users',
            seller_id: (this.props.auth_user.owns_store) ? this.props.auth_user.store_owned.id : this.props.auth_user.id,
            stock_available: 1,
        },
        errors: [],
        focused_image_index: 0,
        thumbnail_image_index: 0,
    }

    componentDidMount = async () => {
        if (this.props.route.params && this.props.route.params.focused_product) {
            this.screen_mode = "edit_existing"

            const focused_product = _.cloneDeep(this.props.route.params.focused_product);
            await focused_product.read()
            this.og_focused_product = _.cloneDeep(focused_product);
            this.setState({
                focused_product_read: true,
                input: {
                    id: focused_product.id,
                    reference: focused_product.reference,
                    name: new Input(focused_product.name),
                    category_id: focused_product.category_id,
                    details: new Input(focused_product.details),
                    entry_type: focused_product.entry_type,
                    price: new Input(focused_product.price),
                    condition: focused_product.condition,
                    commune: new Input(focused_product.commune),
                    wilaya: focused_product.wilaya,
                    images: focused_product.images,
                    //variations: focused_product.variations,
                    seller_table: focused_product.seller_table,
                    seller_id: focused_product.seller_id,
                    stock_available: focused_product.stock_available,
                },
            })
        }
    }

    updateComponentItemStockAvailable(stock_available) {
        this.handleInputChange('stock_available', stock_available, true);
    }

    handleInputChange(field, value, use_as_is = false) {
        let input = this.state.input
        input[field] = (use_as_is) ? value : new Input(value)
        this.setState({ input })
    }

    /*handleVariationInputChange(id, field, value) {
        let variations = this.state.input.variations
        for (let index = 0; index < variations.length; index++) {
            if (variations[index].id == id) {
                variations[index][field] = new Input(value)
                break;
            }
        }
        this.setState({ ...this.state, input: { ...this.state.input, variations } });
    }*/

    /*addRemoveVariation(action = 'add', variation = {}, context = 'outer') {
        if (action == "add") {
            variation = {
                name: new Input(variation.name),
                value: new Input(variation.value),
                price: new Input(variation.price),
                id: Math.max(...this.state.input.variations.map((o) => o.id), 0) + 1
            }
            this.setState({ ...this.state, input: { ...this.state.input, variations: [...this.state.input.variations, variation] } },
                () => {
                    if (context == 'outer') {
                        const translated_variations = this.translated_variations()
                        this[RBSheet + translated_variations[translated_variations.length - 1].id].open()
                    }
                }
            );
            return
        }
        if (action == "remove") {
            if (context == 'outer') {
                this.setState({ ...this.state, input: { ...this.state.input, variations: [...this.state.input.variations.filter((element) => element.name + '' && element.name + '' !== variation.name + '')] } });
            } else {
                this.setState({ ...this.state, input: { ...this.state.input, variations: [...this.state.input.variations.filter((element) => element.id !== variation.id)] } });
            }
            return
        }
    }*/

    load_images_rn(action) {
        const options = {
            maxHeight: 1000,
            maxWidth: 1000,
            selectionLimit: 5,
            mediaType: 'photo',
            includeBase64: false,
        }
        const callbackAction = (results) => {
            if (!results.didCancel && results.assets) {
                let images = []
                results.assets.forEach(element => { images.push({ ...element, name: element.fileName, ready_for_upload: true }) });
                this.setState({ ...this.state, input: { ...this.state.input, images: [...this.state.input.images, ...images] } });
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
            const reset_object = { working: false, picking_images: false, capturing_images: false }
            if (result && !result.cancelled) {
                this.setState({
                    ...this.state,
                    input: {
                        ...this.state.input,
                        images: [...this.state.input.images, { ...result, name: result.uri.split('/').slice(-1)[0], ready_for_upload: true }]
                    },
                    ...reset_object,
                });
            } else { this.setState(reset_object) }
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
        if (!input.name.isValid('name')) {
            errors.push("Invalid product name")
        }
        if (!input.price.isValid('number', 100, 999999999)) {
            errors.push("Invalid Price")
        }
        if (!input.details.isSafeText()) {
            if ((input.details + "")) {
                errors.push("Invalid characters found in details field")
            } else {
                errors.push("Description is required")
            }
        }
        if (!input.commune.isValid('name')) {
            errors.push("Invalid city (commune) name")
        }
        if (!input.images.length) {
            errors.push("Entry must have at least one image")
        }

        if (input.entry_type != 'service' && input.stock_available < 1) {
            errors.push("Stock cannot be less than 1 if entry type is product")
        }

        if (errors.length === 0) {

            this.setState({ errors }) // Remove red lines under text inputs
            let _input = _.cloneDeep(input) // Clone Input instance
            Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = isNumeric(_input[key] + "") ? parseInt(_input[key]) : _input[key] + "" }) // convert Input instances to Text and Numbers
            /*for (let index = 0; index < _input.variations.length; index++) {
                Object.keys(_input.variations[index]).forEach(key => { if (_input.variations[index][key] instanceof Input) _input.variations[index][key] = isNumeric(_input.variations[index][key] + "") ? parseInt(_input.variations[index][key]) : _input.variations[index][key] + "" })
                if (_input.variations[index].price == "") _input.variations[index].price = null
            }*/
            if (this.state.thumbnail_image_index !== 0) _input.images.move(this.state.thumbnail_image_index, 0) // move thumbnail image to beginning of list

            let callbackAction = () => { }
            let success_message = ""

            _input.stock_available = _input.entry_type != 'service' ? _input.stock_available : null

            if (this.screen_mode == "edit_existing") {

                let images_update_object = JSON.parse(JSON.stringify(images_update_object_params))

                for (let i = 0; i < _input.images.length; i++) {
                    _input.images[i].uri = _input.images[i].uri.replace(WEB_URL, '')
                    if (_input.images[i].ready_for_upload) { images_update_object.new_images_to_upload.push(_input.images[i]) }
                }

                for (let i = 0; i < this.og_focused_product.images.length; i++) {
                    this.og_focused_product.images[i].uri = this.og_focused_product.images[i].uri.replace(WEB_URL, '')
                    const exists = _input.images.some((image) => image.id == this.og_focused_product.images[i].id)
                    if (!exists) images_update_object.old_images_to_delete_from_storage.push(this.og_focused_product.images[i])
                    images_update_object.images_to_refresh_in_db.push(this.og_focused_product.images[i])
                }

                /*let variations_update_object = JSON.parse(JSON.stringify(variations_update_object_params))

                for (let i = 0; i < _input.variations.length; i++) {
                    const found = this.og_focused_product.variations.find((variation) => variation.id == _input.variations[i].id)
                    if (!found) variations_update_object.new_variations_to_save.push(found)
                }

                for (let i = 0; i < this.og_focused_product.variations.length; i++) {
                    const exists = _input.variations.some((variation) => variation.id == this.og_focused_product.variations[i].id)
                    if (!exists) variations_update_object.old_variations_to_delete_forever.push(this.og_focused_product.variations[i])
                    variations_update_object.variations_to_refresh_in_db.push(this.og_focused_product.variations[i])
                }*/

                callbackAction = () => (new Product(this.og_focused_product)).update(_input, images_update_object, variations_update_object)
                success_message = 'Update Successful'
            } else {
                callbackAction = () => Product.create(_input)
                success_message = this.props.auth_user.owns_store ? 'Upload Successful!, Your product will is now online' : 'Upload Successful!, Your product will go online once reviewed by the moderators'
            }

            callbackAction().then(() => {
                this.props.flashMessage({ duration: 4000, message: success_message })
                this.props.navigation.goBack()
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

    /*translated_variations = () => {
        let translated_variations = []

        this.state.input.variations.forEach(element => {
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

        if (this.screen_mode == "edit_existing" && !this.state.focused_product_read)
            return (
                <View style={{ alignItems: 'center', padding: 40 }}>
                    <ActivityIndicator size="large" color="#E9446A" />
                </View>
            )

        //const translated_variations = this.translated_variations()

        return (
            <CustomKeyboardAvoidingView style={{ paddingTop: 30 }}>
                <Text style={{ fontSize: 16, textAlign: "center", marginHorizontal: 30, marginBottom: 30 }}>
                    Complete the following and submit for review.
                </Text>

                <View style={styles.text_input_form}>
                    <Text style={styles.input_label}>Product name</Text>
                    <TextInput style={{ ...styles.input_field, borderBottomColor: this.state.input.name.hasError() ? 'red' : styles.input_field.borderBottomColor }}
                        autoCapitalize="none"
                        maxLength={64}
                        onChangeText={name => this.handleInputChange('name', name)}
                        value={this.state.input.name + ""}
                    />
                </View>

                <View style={styles.dropdown_input_form}>
                    <View style={{ flex: 1 }} >
                        <Text style={styles.input_label}>Category</Text>
                    </View>
                    <View style={{ flex: 2 }} >
                        <BottomSheetPicker title_label={'Category'} selected_value={this.state.input.category_id} onValueChange={(ItemValue) => this.handleInputChange('category_id', ItemValue, true)}>
                            {this.props.datalists_collection.product_categories.map((category, key) => (
                                <PickerOption key={key} label={category.name} value={category.id} />
                            ))}
                        </BottomSheetPicker>
                    </View>
                </View>

                <View style={styles.text_input_form}>
                    <Text style={styles.input_label}>Details</Text>
                    <TextInput
                        style={{ ...styles.input_field, height: null, paddingVertical: 5, borderBottomColor: this.state.input.details.hasError() ? 'red' : styles.input_field.borderBottomColor }}
                        autoCapitalize="none"
                        multiline={true}
                        numberOfLines={1}
                        maxHeight={100}
                        maxLength={1024}
                        onChangeText={details => this.handleInputChange('details', details)}
                        value={this.state.input.details + ""}
                    />
                </View>

                <View style={styles.dropdown_input_form}>
                    <View style={{ flex: 1 }} >
                        <Text style={styles.input_label}>Entry Type</Text>
                    </View>
                    <View style={{ flex: 2 }} >
                        <BottomSheetPicker title_label={'Entry Type'} selected_value={this.state.input.entry_type} onValueChange={(ItemValue) => this.handleInputChange('entry_type', ItemValue, true)}>
                            <PickerOption label='Product and/or Service' value='product_and_or_service' />
                            <PickerOption label='Product' value='product' />
                            <PickerOption label='Service' value='service' />
                        </BottomSheetPicker>
                    </View>
                </View>

                <View style={{ ...styles.dropdown_input_form, paddingVertical: 10, marginHorizontal: 30, marginBottom: 0 }}>
                    <View style={{ flex: 1 }} >
                        <Text style={styles.input_label}>Stock available</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Counter
                            start={this.state.input.stock_available}
                            min={1}
                            max={100}
                            onChange={this.updateComponentItemStockAvailable.bind(this)}
                            buttonStyle={{
                                borderColor: '#E9446A',
                                borderWidth: 2,
                                borderRadius: 25,
                                height: 35,
                                paddingTop: Platform.OS == 'android' ? 8 : 0,
                                marginTop: -8,
                            }}
                            buttonTextStyle={{
                                color: '#000'
                            }}
                            countTextStyle={{
                                color: '#000'
                            }}
                        />
                    </View>
                </View>
                <Text style={{ ...styles.input_label, marginHorizontal: 30, marginBottom: styles.dropdown_input_form.marginBottom }}>(Applicable if entry type is product)</Text>

                <View style={styles.text_input_form}>
                    <Text style={styles.input_label}>Price</Text>
                    <TextInput style={{ ...styles.input_field, paddingLeft: 35, borderBottomColor: this.state.input.price.hasError() ? 'red' : styles.input_field.borderBottomColor }}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        maxLength={12}
                        onChangeText={price => this.handleInputChange('price', price.replace(/\D/g, ''))}
                        value={(this.state.input.price + "") ? parseInt(this.state.input.price).toLocaleString() : ""}
                    />
                    <Text style={{ position: 'absolute', top: 20, fontSize: 15 }} >DA</Text>
                </View>

                {/*<View style={styles.variations_input_form}>
                        <Text style={styles.input_label}>Variations</Text>
                        {translated_variations.map((t_variation) => (
                            <View key={t_variation.id}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 2 }}>
                                        <Text >{t_variation.universal_name + ''}</Text>
                                    </View>
                                    <View style={{ flex: 3 }}>
                                        <Text>
                                            {t_variation.singles.map((variation, index) => {
                                                return variation.value + (variation.price && variation.price + '' ? ' (' + priceString(variation.price) + ')' : '') + ((index !== t_variation.singles.length - 1) ? ', ' : '')
                                            })}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Button
                                            icon={
                                                <MaterialCommunityIcons
                                                    name={'square-edit-outline'}
                                                    color={'green'}
                                                    size={22}
                                                />
                                            }
                                            titleStyle={{ color: "#222" }}
                                            type="outline"
                                            TouchableComponent={TouchableOpacity}
                                            buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                            onPress={() => this[RBSheet + t_variation.id].open()}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Button
                                            icon={
                                                <MaterialCommunityIcons
                                                    name={'sticker-remove-outline'}
                                                    color={'red'}
                                                    size={22}
                                                />
                                            }
                                            titleStyle={{ color: "#222" }}
                                            type="outline"
                                            TouchableComponent={TouchableOpacity}
                                            buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                            onPress={() => this.addRemoveVariation('remove', t_variation, 'outer')}
                                        />
                                    </View>
                                </View>
                                <RBSheet
                                    ref={ref => { this[RBSheet + t_variation.id] = ref; }}
                                    height={400}
                                    openDuration={250}
                                    closeDuration={20}
                                    onClose={() => {
                                        t_variation.singles.forEach(element => {
                                            if (!(element.name + "" && element.value + '')) {
                                                this.addRemoveVariation('remove', element, 'inner')
                                            }
                                        });
                                    }}
                                    customStyles={{ container: { borderTopRightRadius: 20, borderTopLeftRadius: 20 } }}
                                >
                                    <ScrollView>
                                        {t_variation.singles.map((variation, index) => (
                                            <View key={variation.id} style={{ marginTop: 10 }}>
                                                {index == 0 ? (
                                                    <>
                                                        {t_variation.singles.length == 1 ? (
                                                            <View style={styles.text_input_form}>
                                                                <Text style={styles.input_label}>Variation Name</Text>
                                                                <TextInput style={styles.input_field}
                                                                    placeholder="Colour"
                                                                    autoCapitalize="none"
                                                                    maxLength={16}
                                                                    onChangeText={name => this.handleVariationInputChange(variation.id, 'name', ucfirst(name))}
                                                                    value={variation.name + ""}
                                                                />
                                                            </View>
                                                        ) : (
                                                            <View style={styles.dropdown_input_form}>
                                                                <View style={{ flex: 2, marginVertical: 10 }} >
                                                                    <Text style={styles.input_label}>Variation Name</Text>
                                                                </View>
                                                                <View style={{ flex: 3, marginLeft: 10 }} >
                                                                    <Text>{variation.name + ""}</Text>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </>
                                                ) : null}
                                                <View style={{ flexDirection: 'row', marginHorizontal: 30 }}>
                                                    <View style={{ flex: 3 }}>
                                                        <Text style={styles.input_label}>{t_variation.singles.length == 1 ? 'Variation ' : ''}Value</Text>
                                                        <TextInput style={styles.input_field}
                                                            placeholder='Blue'
                                                            autoCapitalize="none"
                                                            maxLength={16}
                                                            onChangeText={value => this.handleVariationInputChange(variation.id, 'value', ucfirst(value))}
                                                            value={variation.value + ""}
                                                        />
                                                    </View>
                                                    <View style={{ flex: 3 }}>
                                                        <Text style={styles.input_label}>Price</Text>
                                                        <TextInput style={{ ...styles.input_field, paddingLeft: 35 }}
                                                            keyboardType="phone-pad"
                                                            autoCapitalize="none"
                                                            maxLength={12}
                                                            onChangeText={price => this.handleVariationInputChange(variation.id, 'price', price.replace(/\D/g, ''))}
                                                            value={(variation.price && variation.price + '') ? parseInt(variation.price).toLocaleString() : ""}
                                                        />
                                                        <Text style={{ position: 'absolute', top: 23, fontSize: 15 }} >{(variation.price && variation.price + '') ? 'DZD' : 'N/A'}</Text>
                                                    </View>
                                                    <View style={{ flex: 1, paddingTop: 14 }}>
                                                        <Button
                                                            icon={
                                                                <MaterialCommunityIcons
                                                                    name={'sticker-remove-outline'}
                                                                    color={'red'}
                                                                    size={22}
                                                                />
                                                            }
                                                            titleStyle={{ color: "#222" }}
                                                            type="outline"
                                                            TouchableComponent={TouchableOpacity}
                                                            buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                                            onPress={() => this.addRemoveVariation('remove', variation, 'inner')}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                        <Text style={{ ...styles.input_label, marginHorizontal: 30 }}>(Leave price empty if variation has the same price with main article)</Text>

                                        <View style={{ paddingTop: 20, marginHorizontal: 30 }}>
                                            <Button
                                                icon={
                                                    <Ionicons
                                                        name={'add'}
                                                        size={22}
                                                    />
                                                }
                                                title={'Add'}
                                                titleStyle={{ color: "#222" }}
                                                type="outline"
                                                TouchableComponent={TouchableOpacity}
                                                buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                                onPress={() => {
                                                    this.addRemoveVariation('add', { name: t_variation.universal_name, value: '' }, 'inner')
                                                }}
                                            />
                                        </View>
                                        <View style={{ paddingVertical: 20, marginHorizontal: 30 }}>
                                            <Button
                                                icon={
                                                    <Ionicons
                                                        name={'checkmark-done'}
                                                        size={22}
                                                    />
                                                }
                                                title={'Done'}
                                                titleStyle={{ color: "#222" }}
                                                type="outline"
                                                TouchableComponent={TouchableOpacity}
                                                buttonStyle={{ margin: 0 }}
                                                onPress={() => this[RBSheet + t_variation.id].close()}
                                            />
                                        </View>
                                    </ScrollView>
                                </RBSheet>
                            </View>
                        ))}
                        <View style={{ paddingTop: 10 }}>
                            <Button
                                icon={
                                    <Ionicons
                                        name={'add'}
                                        size={22}
                                    />
                                }
                                title={'Add'}
                                titleStyle={{ color: "#222" }}
                                type="outline"
                                TouchableComponent={TouchableOpacity}
                                buttonStyle={{ borderColor: "#bbb", margin: 0 }}
                                onPress={() => {
                                    this.addRemoveVariation('add', { name: '', value: '' }, 'outer')
                                }}
                            />
                        </View>
                        <Text style={{ ...styles.input_label, marginBottom: styles.dropdown_input_form.marginBottom }}>(Applicable if you have more than one product in stock)</Text>
                    </View>*/}

                <View style={styles.dropdown_input_form}>
                    <View style={{ flex: 1 }} >
                        <Text style={styles.input_label}>Condition</Text>
                    </View>
                    <View style={{ flex: 2 }} >
                        <BottomSheetPicker title_label={'Condition'} selected_value={this.state.input.condition} onValueChange={(ItemValue) => this.handleInputChange('condition', ItemValue, true)}>
                            <PickerOption label='Brand new 10/10' value='brand_new' />
                            <PickerOption label='Good as new 8/10' value='good_as_new' />
                            <PickerOption label='Used and still okay 5/10' value='used' />
                            <PickerOption label='Not Applicable (N/A)' value='not_applicable' />
                        </BottomSheetPicker>
                    </View>
                </View>

                <View style={styles.text_input_form}>
                    <Text style={styles.input_label}>City (Commune)</Text>
                    <TextInput style={{ ...styles.input_field, borderBottomColor: this.state.input.commune.hasError() ? 'red' : styles.input_field.borderBottomColor }}
                        autoCapitalize="none"
                        maxLength={32}
                        onChangeText={commune => this.handleInputChange('commune', commune)}
                        value={this.state.input.commune + ""}
                    />
                </View>

                <View style={styles.dropdown_input_form}>
                    <View style={{ flex: 1 }} >
                        <Text style={styles.input_label}>Wilaya</Text>
                    </View>
                    <View style={{ flex: 2 }} >
                        <BottomSheetPicker title_label={'Wilaya'} selected_value={this.state.input.wilaya} onValueChange={(ItemValue) => this.handleInputChange('wilaya', ItemValue, true)}>
                            {this.props.datalists_collection.wilayas.sort((a, b) => a.tier - b.tier).map((wilaya, key) => (
                                <PickerOption key={key} label={wilaya.name} value={wilaya.name} />
                            ))}
                        </BottomSheetPicker>
                    </View>
                </View>

                {this.state.input.images.length ? (
                    <View>
                        <SliderBox
                            images={[...this.state.input.images, require('../../../../assets/general-img/click-to-upload.jpg')]}
                            dotColor="#E9446A"
                            inactiveDotColor="#a7a7a7"
                            style={styles.image}
                            dotStyle={{
                                width: 10,
                                height: 10,
                                borderRadius: 15
                            }}
                            currentImageEmitter={index => this.setState({ focused_image_index: index })}
                            onCurrentImagePressed={index => {
                                if (index === this.state.input.images.length) this.image_picker_bottom_sheet.open()
                            }}
                        />
                        <View style={{ flexDirection: 'row', marginHorizontal: 30 }} >
                            <View style={{ flex: 3 }} >
                                <Button
                                    disabled={this.state.focused_image_index === this.state.thumbnail_image_index || this.state.focused_image_index === this.state.input.images.length}
                                    disabledTitleStyle={this.state.focused_image_index === this.state.thumbnail_image_index && this.state.focused_image_index !== this.state.input.images.length ? { color: "#222" } : { color: "#bbb" }}
                                    icon={<Ionicons
                                        name={this.state.focused_image_index === this.state.thumbnail_image_index && this.state.focused_image_index !== this.state.input.images.length ? "ios-checkbox" : "ios-checkbox-outline"}
                                        size={20}
                                        color={this.state.focused_image_index === this.state.thumbnail_image_index && this.state.focused_image_index !== this.state.input.images.length ? "green" : "#bbb"}
                                        style={{ marginRight: 10 }} />}
                                    title="Thumbnail"
                                    titleStyle={{ color: "#222" }}
                                    type="outline"
                                    TouchableComponent={TouchableOpacity}
                                    buttonStyle={{ borderColor: "#bbb" }}
                                    onPress={() => this.setState({ thumbnail_image_index: this.state.focused_image_index })}
                                />
                            </View>
                            <View style={{ flex: 3 }} >
                                <Button
                                    title="Remove Image"
                                    disabled={this.state.focused_image_index === this.state.input.images.length}
                                    titleStyle={{ color: "#222" }}
                                    type="outline"
                                    TouchableComponent={TouchableOpacity}
                                    buttonStyle={{ borderColor: "#bbb" }}
                                    onPress={() => {
                                        let { images } = this.state.input
                                        images.splice(this.state.focused_image_index, 1)
                                        const thumbnail_image_index = this.state.focused_image_index === this.state.thumbnail_image_index ? 0 : this.state.thumbnail_image_index > this.state.focused_image_index ? this.state.thumbnail_image_index - 1 : this.state.thumbnail_image_index
                                        this.setState({ ...this.state, thumbnail_image_index, input: { ...this.state.input, images } })
                                    }}
                                />
                            </View>
                            <View style={{ flex: 1 }} >
                                <Button
                                    icon={
                                        <Ionicons name="md-add" size={22} color="#222" />
                                    }
                                    titleStyle={{ color: "#222" }}
                                    type="outline"
                                    TouchableComponent={TouchableOpacity}
                                    buttonStyle={{ borderColor: "#bbb" }}
                                    onPress={() => this.image_picker_bottom_sheet.open()}
                                />
                            </View>
                        </View>

                    </View>
                ) : (
                    <TouchableOpacity style={styles.camera} onPress={() => this.image_picker_bottom_sheet.open()} >
                        <Ionicons name="ios-camera" size={40} />
                        <Text style={{ paddingTop: 10, paddingLeft: 10, fontSize: 16 }}>Add Image(s)</Text>
                    </TouchableOpacity>
                )}

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

                {this.state.errors.length ? (
                    <View style={styles.errors_field}>
                        {this.state.errors.map((error, key) => (
                            <Text key={key} style={styles.error}>• {error}</Text>
                        ))}
                    </View>
                ) : null}

                <TouchableOpacity
                    style={styles.submit_button}
                    onPress={this.handleSubmit}
                    disabled={this.state.working}
                >
                    {this.state.working ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text
                            style={{
                                color: 'white',
                                fontSize: 16,
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            {this.screen_mode == "create_new" ? (this.props.auth_user.store_owned ? "Publish" : "Submit For Review") : "Publish Changes"}
                        </Text>
                    )}
                </TouchableOpacity>
            </CustomKeyboardAvoidingView>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth_user: state.auth_user_data ? new User(state.auth_user_data, ["store_owned", "address"]) : null,
        datalists_collection: state.datalists_collection,
        active_connect_instance_data: state.active_connect_instance_data
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        flashMessage: (params) => dispatch(flashMessage(params))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductEditScreen);

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
    submit_button: {
        backgroundColor: '#E9446A',
        borderRadius: 15,
        marginBottom: 50,
        height: 50,
        margin: 30,
        flex: 7,
        justifyContent: 'center'
    },
    image: {
        width,
        height,
        marginHorizontal: 30,
        marginTop: 10,
        resizeMode: 'cover'
    },
    camera: {
        marginHorizontal: 30,
        flexDirection: "row",
    },
    text_input_form: {
        marginHorizontal: 30,
        marginBottom: 30,
        marginTop: 20
    },
    /*variations_input_form: {
        marginHorizontal: 30,
        marginVertical: 20,
    },*/
    dropdown_input_form: {
        marginHorizontal: 30,
        marginBottom: 30,
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
    }
});