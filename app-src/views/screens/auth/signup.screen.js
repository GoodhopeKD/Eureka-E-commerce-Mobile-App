import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';

import CustomKeyboardAvoidingView from '../../components/custom-keyboard-avoiding-view.component';

import { User, Input, flashMessage } from '../../../controller/index';

const DEBUG = false

class SignUpScreen extends React.Component {

	state = {
		working: false,
		input: {
			surname: new Input(Input.debug_form_autofill(DEBUG, "Ntate")),
			name_s: new Input(Input.debug_form_autofill(DEBUG, "Lewis")),
			email: new Input(Input.debug_form_autofill(DEBUG, "lewis.ntate@eureka.com")),
			password: new Input(Input.debug_form_autofill(DEBUG, "Password1")),
			password_confirmation: new Input(Input.debug_form_autofill(DEBUG, "Password1")),
		},
		errors: [],
	};

	handleInputChange(field, value) {
		let input = this.state.input
		input[field] = new Input(value)
		this.setState({ input })
	}

	handleSubmit = () => {
		this.setState({ working: true })
		const working = false

		let errors = []

		let input = this.state.input
		if (!input.email.isValid('email')) {
			errors.push("Invalid email address")
		}
		if (!input.password.isValid('password')) {
			errors.push("Password should have: at least 8 characters; at least 1 of: numbers, uppercase, lowercase characters")
		}
		if (!input.surname.isValid('name', 2, 32)) {
			errors.push("Invalid input in field Last Name")
		}
		if (!input.name_s.isValid('name', 2, 64)) {
			errors.push("Invalid input in field Name(s)")
		}
		if (!input.password_confirmation.matches(input.password + "")) {
			errors.push("Passwords Mismatch")
		}

		if (errors.length === 0) {
			input.email.async_checkIfUnique('email').then((response) => {
				if (input.email.isUnique('email')) {

					this.setState({ errors }) // Remove red lines under text inputs
					let _input = Object.assign(Object.create(Object.getPrototypeOf(input)), input) // Dereference input object
					Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = _input[key] + "" }) // convert Input instances to Text

					User.signUp(_input).then(response => {
						this.props.flashMessage({ duration: 750, message: 'Sign up successful!' })
					}).catch((error) => {
						errors.push(error.message)
						this.setState({ working, errors })
					})
				} else {
					errors.push("Email already exists")
					this.setState({ working, errors, input })
				}
			}).catch((error) => {
				errors.push("Connection Error")
				this.setState({ working, errors })
			})
		} else {
			this.setState({ working, errors, input })
		}
	}

	render() {
		return (
			<CustomKeyboardAvoidingView>

				<Text testID="greetingMessage" style={styles.greeting}>{'Hello 👋🏿 \n Sign up and start shopping 🛒.'}</Text>

				<View style={styles.form}>
					<Text style={styles.input_label}>Last name</Text>
					<TextInput
						style={{ ...styles.input_field, borderBottomColor: this.state.input.surname.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						onChangeText={surname => this.handleInputChange('surname', surname)}
						value={this.state.input.surname + ""}
						testID="lastNameField"
					/>
				</View>

				<View style={styles.form}>
					<Text style={styles.input_label}>Name(s)</Text>
					<TextInput
						style={{ ...styles.input_field, borderBottomColor: this.state.input.name_s.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						onChangeText={name_s => this.handleInputChange('name_s', name_s)}
						value={this.state.input.name_s + ""}
						testID="firstNameField"
					/>
				</View>

				<View style={styles.form}>
					<Text style={styles.input_label}>Email address</Text>
					<TextInput
						style={{ ...styles.input_field, borderBottomColor: this.state.input.email.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						keyboardType={'email-address'}
						autoCapitalize="none"
						onChangeText={email => this.handleInputChange('email', email)}
						value={this.state.input.email + ""}
						testID="emailAddressField"
					/>
				</View>

				<View style={styles.form}>
					<Text style={styles.input_label}>Password</Text>
					<TextInput
						style={{ ...styles.input_field, borderBottomColor: this.state.input.password.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						secureTextEntry={true}
						onChangeText={(password) => this.handleInputChange('password', password)}
						value={this.state.input.password + ""}
						testID="passwordField"
					/>
				</View>

				<View style={styles.form}>
					<Text style={styles.input_label}>Confirm Password</Text>
					<TextInput
						style={{ ...styles.input_field, borderBottomColor: this.state.input.password_confirmation.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						secureTextEntry={true}
						onChangeText={(password_confirmation) => this.handleInputChange('password_confirmation', password_confirmation)}
						value={this.state.input.password_confirmation + ""}
						testID="confirmPasswordField"
					/>
				</View>

				<View style={styles.errors_field}>
					{this.state.errors.map((error, key) => (
						<Text key={key} style={styles.error}>• {error}</Text>
					))}
				</View>

				<TouchableOpacity
					style={styles.button}
					onPress={this.handleSubmit}
					disabled={this.state.working}
					testID="signUpButton"
				>
					{this.state.working ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={{ color: '#FFF', fontWeight: '500' }}>Sign up</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					testID='signInButtonAlt'
					style={{ alignSelf: 'center', marginTop: 32 }}
					onPress={() => this.props.navigation.goBack()}
					disabled={this.state.working}
				>
					<Text testID='signInAltText' style={{ color: '#414959', fontSize: 13 }}>
						Got an account? <Text style={{ color: '#000', fontWeight: '700' }}>Sign in</Text>
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={{ alignSelf: 'center', marginVertical: 50 }}
					onPress={() => Linking.openURL('https://eureka.vercel.app/EUREKATERMSANDCONDITIONS.docx')}
					disabled={this.state.working}
				>
					<Text testID='temsAndCndtn' style={{ color: '#414959', fontSize: 13 }}>
						By clicking 'Sign up' you accept Eureka's{' '}
						<Text style={{ color: '#000', fontWeight: '700' }}>Terms & Conditions</Text>
					</Text>
				</TouchableOpacity>
			</CustomKeyboardAvoidingView>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		flashMessage: (params) => dispatch(flashMessage(params))
	};
};

export default connect(null, mapDispatchToProps)(SignUpScreen);

const styles = StyleSheet.create({
	greeting: {
		marginTop: 32,
		textAlign: 'center',
		fontSize: 18,
		fontWeight: '400',
		paddingBottom: 20
	},
	errors_field: {
		paddingBottom: 30,
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
	form: {
		marginHorizontal: 30,
		marginBottom: 30
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
		height: 40
	},
	button: {
		backgroundColor: '#E9446A',
		marginHorizontal: 30,
		borderRadius: 5,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center'
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 50,
		backgroundColor: '#000000',
		marginTop: 20,
		marginHorizontal: 150,
		alignItems: 'center',
		justifyContent: 'center'
	},
	checkbox: {
		marginHorizontal: 30,
		marginBottom: 48
	}
});
