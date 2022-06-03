import React from 'react';
import { connect } from 'react-redux';

import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { BottomSheetPicker, PickerOption } from '../components/bottom-sheet-picker.component';

import { flashMessage, PhoneResource, Phone, Input } from '../../controller/index';

class PhonesViewEdit extends React.Component {

    state = {
        working: false,
        input: {
            number: new Input((this.props.auth_user.phones.length) ? this.props.auth_user.phones[0].number : ''),
            tag: (this.props.auth_user.phones.length) ? this.props.auth_user.phones[0].tag : 'calls_or_whatsapp',
            country_code: new Input((this.props.auth_user.phones.length) ? this.props.auth_user.phones[0].country_code : ''),
        },
        errors: [],
        input_fields_element_open_state: []
    }

    componentDidMount() {
        this.resetState();
    }

    resetState() {
        const auth_user = this.props.auth_user
        const nav_context = this.props.nav_context
        const focused_order = this.props.focused_order

        const input = (nav_context === 'my-details-screen') ? {
            number: new Input((auth_user.phones.length) ? auth_user.phones[0].number : ''),
            tag: (auth_user.phones.length) ? auth_user.phones[0].tag : 'calls_or_whatsapp',
            country_code: new Input((auth_user.phones.length) ? auth_user.phones[0].country_code : ''),
        } : {
            number: new Input(focused_order.delivery_phone ? focused_order.delivery_phone.number : ''),
            tag: new Input(focused_order.delivery_phone ? focused_order.delivery_phone.tag : 'calls'),
            country_code: new Input(focused_order.delivery_phone ? focused_order.delivery_phone.country_code : ''),
        }
        this.setState({ working: false, input, errors: [], input_fields_element_open_state: [] })
    }

    handleInputChange(field, value, use_as_is = false) {
        let input = this.state.input
        input[field] = (use_as_is) ? value : new Input(value)
        this.setState({ input })
    }

    toggleInputFieldState(input_field_name, open_state) {
        const element = this.state.input_fields_element_open_state.find((element) => element.input_field_name == input_field_name)
        const input_fields_element_open_state = element ?
            [...this.state.input_fields_element_open_state.filter((element) => element.input_field_name !== input_field_name), { ...element, open_state }] :
            [...this.state.input_fields_element_open_state, { input_field_name, open_state }]
        this.setState({ input_fields_element_open_state })
    }

    handleSubmit(input_field_name) {
        this.setState({ working: true })

        let errors = []
        let { input } = this.state

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

            const auth_user = this.props.auth_user
            const phone_data = { country_code: _input.country_code + "", tag: _input.tag, number: _input.number + "" }
            if (this.props.nav_context === 'my-details-screen') {
                if (auth_user.phones.length) {
                    callbackAction = () => auth_user.phones[0].update(phone_data)
                } else {
                    callbackAction = () => auth_user.addRelatedMember('phone', phone_data)
                }
            } else {
                callbackAction = async () => {
                    await this.props.focused_order.update({ delivery_phone: phone_data }, null, null, 'local')
                    this.props.triggerLoadPin()
                    Promise.resolve()
                }
            }

            callbackAction().then(() => {
                this.toggleInputFieldState(input_field_name, false)
                this.props.flashMessage({ duration: 4000, message: "Details updated" })
                this.resetState()
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

    render() {
        const auth_user = this.props.auth_user

        const focused_order = this.props.focused_order

        let phones = (this.props.nav_context === 'checkout-screen' && focused_order.delivery_phone) ? [focused_order.delivery_phone] : (auth_user.phones && auth_user.phones.length ? auth_user.phones : [new Phone({ ...PhoneResource, country_code: '213', number: '_', tag: 'calls_or_whatsapp' })])

        for (let index = 0; index < phones.length; index++) {
            phones[index].option_name = ucfirst(phones[index].pretty_tag())
            phones[index].value = '(+' + phones[index].country_code + ') ' + phones[index].number
            phones[index].input_field_name = 'number'
        }

        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={phones}
                    keyExtractor={(item, key) => key.toString()}
                    ListHeaderComponent={
                        <View style={{ marginTop: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}><Text style={{ fontWeight: 'bold', fontSize: 20, }}>Phone</Text></View>
                        </View>
                    }
                    ListFooterComponent={
                        (this.state.errors.length) ?
                            <View style={styles.errors_field}>
                                {this.state.errors.map((error, key) => (
                                    <Text key={key} style={styles.error}>• {error}</Text>
                                ))}
                            </View>
                            : null
                    }
                    renderItem={({ item }) => {
                        const element = this.state.input_fields_element_open_state.find((element) => element.input_field_name == item.input_field_name)
                        const input_field_element_open_state = element ? element.open_state : false
                        let keyboard_type = 'default'
                        let placeholder = item.option_name
                        if (item.input_field_name == 'number') { keyboard_type = 'phone-pad'; placeholder = "555123456" }

                        return (
                            <ListItem /* containerStyle={{  borderRadius: 10 }} */ >
                                <ListItem.Content>
                                    {input_field_element_open_state ? (
                                        <BottomSheetPicker style={{ width: 120, marginLeft: -10 }} selected_value={this.state.input.tag} onValueChange={(ItemValue) => this.handleInputChange('tag', ItemValue, true)}>
                                            <PickerOption label='Calls/Whatsapp' value='calls_or_whatsapp' />
                                            <PickerOption label='Calls' value='calls' />
                                            <PickerOption label='Whatsapp' value='whatsapp' />
                                        </BottomSheetPicker>
                                    ) : (
                                        <ListItem.Title style={{ fontSize: 16.5 }} >
                                            {item.option_name}
                                        </ListItem.Title>
                                    )}
                                </ListItem.Content>
                                {input_field_element_open_state ? (
                                    <View style={{ flex: 2, flexDirection: 'row' }}>

                                        <TextInput style={{ ...styles.input_field, flex: 1, paddingRight: 0, borderBottomColor: this.state.input.country_code.hasError() ? 'red' : styles.input_field.borderBottomColor }}
                                            autoCapitalize="none"
                                            placeholder='+213'
                                            maxLength={5}
                                            keyboardType="phone-pad"
                                            onChangeText={value => this.handleInputChange('country_code', value)}
                                            value={(this.state.input.country_code + "") ? "+" + (this.state.input.country_code + "").replace(/^\++/, '') : ""}
                                        />
                                        <TextInput style={{ ...styles.input_field, flex: 2, borderBottomColor: this.state.input[item.input_field_name].hasError() ? 'red' : styles.input_field.borderBottomColor }}
                                            autoCapitalize="none"
                                            placeholder={placeholder}
                                            keyboardType={keyboard_type}
                                            onChangeText={value => this.handleInputChange(item.input_field_name, value)}
                                            value={(this.state.input[item.input_field_name] + "").replace(/^0+/, '')}
                                        />
                                        <TouchableOpacity disabled={this.state.working} style={{ position: 'absolute', right: 0 }} onPress={() => this.handleSubmit(item.input_field_name)}>
                                            {this.state.working ? (
                                                <ActivityIndicator color="green" size='small' />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name={'content-save-move-outline'}
                                                    color={'green'}
                                                    size={22}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={{ fontSize: 16.5, flex: 2 }} >
                                        {item.value}
                                    </Text>
                                )}
                                <TouchableOpacity onPress={() => this.toggleInputFieldState(item.input_field_name, !input_field_element_open_state)}>
                                    <MaterialCommunityIcons
                                        name={(input_field_element_open_state) ? 'cancel' : item.icon_name ? item.icon_name : 'square-edit-outline'}
                                        color={'#E9446A'}
                                        size={22}
                                    />
                                </TouchableOpacity>
                            </ListItem>
                        );
                    }}
                />
            </View>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        flashMessage: (params) => dispatch(flashMessage(params))
    };
};

export default connect(null, mapDispatchToProps)(PhonesViewEdit);


const styles = StyleSheet.create({
    errors_field: {
        paddingVertical: 10,
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
        height: 50,
        margin: 30,
        flex: 7,
        justifyContent: 'center'
    },
    text_input_form: {
        marginHorizontal: 30,
        marginBottom: 30,
        marginTop: 20
    },
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
        marginVertical: -5,
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
        color: '#161F3D',
        fontSize: 16.5,
        paddingRight: 35
    }
});