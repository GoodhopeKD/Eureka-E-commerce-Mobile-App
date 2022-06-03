import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';

import CustomKeyboardAvoidingView from '../../components/custom-keyboard-avoiding-view.component';
import { BottomSheetPicker, PickerOption } from '../../components/bottom-sheet-picker.component';

import { User, Input, flashMessage } from '../../../controller/index';

class AddressEditScreen extends React.Component {

	state = {
		working: false,
		input: {
			surname: new Input(this.props.auth_user.address ? this.props.auth_user.address.surname : this.props.auth_user.surname),
			name_s: new Input(this.props.auth_user.address ? this.props.auth_user.address.name_s : this.props.auth_user.name_s),
			address_line_one: new Input(this.props.auth_user.address ? this.props.auth_user.address.address_line_one : ''),
			address_line_two: new Input(this.props.auth_user.address ? this.props.auth_user.address.address_line_two : ''),
			postal_code: new Input(this.props.auth_user.address ? this.props.auth_user.address.postal_code : ''),
			commune: new Input(this.props.auth_user.address ? this.props.auth_user.address.commune : ''),
			wilaya: this.props.auth_user.address ? this.props.auth_user.address.wilaya : '',
		},
		request_location: {},
		errors: [],
	};

	componentDidMount() {
		const request_location = this.props.active_connect_instance_data.request_location
		const detected_wilaya = request_location && request_location.regionName ? (request_location.regionName == 'Algiers' ? 'Alger' : request_location.regionName) : 'Chlef'
		const detected_commune = request_location && request_location.cityName ? (request_location.cityName == 'Algiers' ? 'Alger' : request_location.cityName) : 'Bab Ezzouar'

		const auth_user = this.props.auth_user
		const nav_context = this.props.route.params.nav_context
		const focused_order = this.props.route.params.focused_order
		const input = (nav_context == 'my-details-screen') ? {
			surname: new Input(auth_user.address ? auth_user.address.surname : auth_user.surname),
			name_s: new Input(auth_user.address ? auth_user.address.name_s : auth_user.name_s),
			address_line_one: new Input(auth_user.address ? auth_user.address.address_line_one : ''),
			address_line_two: new Input(auth_user.address ? auth_user.address.address_line_two : ''),
			postal_code: new Input(auth_user.address ? auth_user.address.postal_code : ''),
			commune: new Input(auth_user.address ? auth_user.address.commune : detected_commune),
			wilaya: auth_user.address ? auth_user.address.wilaya : detected_wilaya,
		} : {
			surname: new Input(focused_order.delivery_address ? focused_order.delivery_address.surname : auth_user.surname),
			name_s: new Input(focused_order.delivery_address ? focused_order.delivery_address.name_s : auth_user.name_s),
			address_line_one: new Input(focused_order.delivery_address ? focused_order.delivery_address.address_line_one : ''),
			address_line_two: new Input(focused_order.delivery_address ? focused_order.delivery_address.address_line_two : ''),
			postal_code: new Input(focused_order.delivery_address ? focused_order.delivery_address.postal_code : ''),
			commune: new Input(focused_order.delivery_address ? focused_order.delivery_address.commune : detected_commune),
			wilaya: focused_order.delivery_address ? focused_order.delivery_address.wilaya : detected_wilaya,
		}
		this.setState({ nav_context, focused_order, input, request_location })
	}

	handleInputChange(field, value, use_as_is = false) {
		let input = this.state.input
		input[field] = (use_as_is) ? value : new Input(value)
		this.setState({ input })
	}

	handleSubmit = () => {
		this.setState({ working: true })
		const working = false

		let errors = []

		let input = this.state.input
		if (!input.surname.isValid('name', 2, 32)) {
			errors.push("Invalid input in field Last Name")
		}
		if (!input.name_s.isValid('name', 2, 64)) {
			errors.push("Invalid input in field Name(s)")
		}
		if (!input.address_line_one.isSafeText()) {
			if ((input.address_line_one + "")) {
				errors.push("Invalid characters found in address line 1")
			} else {
				errors.push("Address line 1 is required")
			}
		}
		if ((input.address_line_one + "") && !input.address_line_one.isSafeText()) {
			errors.push("Invalid characters found in address line 2")
		}

		if ((input.postal_code + "") && !input.postal_code.isValid('number', 1000, 49000)) {
			errors.push("Invalid Postal Code (Leave empty if unsure)")
		}

		if (!input.commune.isValid('name')) {
			errors.push("Invalid city (commune) name")
		}

		if (errors.length === 0) {
			this.setState({ errors }) // Remove red lines under text inputs
			let _input = Object.assign(Object.create(Object.getPrototypeOf(input)), input) // Dereference input object
			Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = _input[key] + "" }) // convert Input instances to Text
			if (_input.postal_code) _input.postal_code = _input.postal_code + ""

			let callbackAction = () => { }

			if (this.state.nav_context == 'my-details-screen') {
				if (this.props.auth_user.address) {
					callbackAction = () => this.props.auth_user.address.update(_input)
				} else {
					callbackAction = () => this.props.auth_user.addRelatedMember('address', _input)
				}
			} else {
				callbackAction = () => this.state.focused_order.update({ delivery_address: _input }, null, null, 'local')
			}

			callbackAction().then(() => {
				this.props.flashMessage({ duration: 1000, message: 'Update Successful!' })
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
				this.setState({ working, errors })
			})
		} else {
			this.setState({ working, errors, input })
		}
	}

	render() {
		return (
			<CustomKeyboardAvoidingView>
				<View style={{ flex: 1, marginTop: 40 }}>
					<View style={styles.text_input_form}>
						<Text style={styles.input_label}>Last name</Text>
						<TextInput
							testID='lnField'
							style={{ ...styles.input_field, borderBottomColor: this.state.input.surname.hasError() ? 'red' : styles.input_field.borderBottomColor }}
							autoCapitalize="none"
							maxLength={32}
							onChangeText={surname => this.handleInputChange('surname', surname)}
							value={this.state.input.surname + ""}
						/>
					</View>

					<View style={styles.text_input_form}>
						<Text style={styles.input_label}>Name(s)</Text>
						<TextInput
							testID='fnField'
							style={{ ...styles.input_field, borderBottomColor: this.state.input.name_s.hasError() ? 'red' : styles.input_field.borderBottomColor }}
							autoCapitalize="none"
							maxLength={64}
							onChangeText={name_s => this.handleInputChange('name_s', name_s)}
							value={this.state.input.name_s + ""}
						/>
					</View>

					<View style={styles.text_input_form}>
						<Text style={styles.input_label}>Address Line 1</Text>
						<TextInput
							testID='daField'
							style={{ ...styles.input_field, borderBottomColor: this.state.input.address_line_one.hasError() ? 'red' : styles.input_field.borderBottomColor }}
							autoCapitalize="none"
							maxLength={255}
							multiline={true}
							numberOfLines={1}
							maxHeight={100}
							onChangeText={address_line_one => this.handleInputChange('address_line_one', address_line_one)}
							value={this.state.input.address_line_one + ""}
						/>
					</View>

					<View style={styles.text_input_form}>
						<Text style={styles.input_label}>Address Line 2 (Optional)</Text>
						<TextInput
							style={{ ...styles.input_field, borderBottomColor: this.state.input.address_line_two.hasError() ? 'red' : styles.input_field.borderBottomColor }}
							autoCapitalize="none"
							maxLength={255}
							multiline={true}
							numberOfLines={1}
							maxHeight={100}
							onChangeText={address_line_two => this.handleInputChange('address_line_two', address_line_two)}
							value={this.state.input.address_line_two + ""}
						/>
					</View>

					<View style={styles.text_input_form}>
						<Text style={styles.input_label}>Postal Code (Optional)</Text>
						<TextInput style={{ ...styles.input_field, borderBottomColor: this.state.input.postal_code.hasError() ? 'red' : styles.input_field.borderBottomColor }}
							keyboardType={'number-pad'}
							autoCapitalize="none"
							maxLength={6}
							placeholder={'e.g. ' + ((new Input(this.state.request_location.zipCode)).isValid('number', 1000, 49000) ? this.state.request_location.zipCode : 16000)}
							onChangeText={postal_code => this.handleInputChange('postal_code', postal_code)}
							value={this.state.input.postal_code + ""}
						/>
					</View>

					<View style={styles.text_input_form}>
						<Text style={styles.input_label}>City (Commune)</Text>
						<TextInput style={{ ...styles.input_field, borderBottomColor: this.state.input.commune.hasError() ? 'red' : styles.input_field.borderBottomColor }}
							testID='cityField'
							autoCapitalize="none"
							maxLength={32}
							placeholder={this.state.request_location.cityName == 'Algiers' ? 'e.g. Alger' : 'e.g. ' + this.state.request_location.cityName}
							onChangeText={commune => this.handleInputChange('commune', commune)}
							value={this.state.input.commune + ""}
						/>
					</View>

					<View testID='wilayaField' style={styles.dropdown_input_form}>
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

					<View style={styles.errors_field}>
						{this.state.errors.map((error, key) => (
							<Text key={key} style={styles.error}>• {error}</Text>
						))}
					</View>

					<TouchableOpacity
						testID='submitButton'
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
								Submit
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</CustomKeyboardAvoidingView>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data, ['address']) : null,
		datalists_collection: state.datalists_collection,
		active_connect_instance_data: state.active_connect_instance_data,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		flashMessage: (params) => dispatch(flashMessage(params))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(AddressEditScreen);

const styles = StyleSheet.create({
	errors_field: {
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
	},
	dropdown_input_form: {
		marginHorizontal: 30,
		marginBottom: 30,
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