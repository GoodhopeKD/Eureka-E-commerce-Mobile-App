import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

import CustomKeyboardAvoidingView from '../../components/custom-keyboard-avoiding-view.component';

import { User, Input, flashMessage } from '../../../controller/index';

const DEBUG = true

class SignInScreen extends React.Component {

	state = {
		working: false,
		input: {
			email: new Input(Input.debug_form_autofill(DEBUG, "primrose.jambaya@eureka.com")),
			password: new Input(Input.debug_form_autofill(DEBUG, "Password1")),
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
			errors.push("Invalid password")
		}

		if (errors.length === 0) {

			this.setState({ errors }) // Remove red lines under text inputs
			let _input = Object.assign(Object.create(Object.getPrototypeOf(input)), input) // Dereference input object
			Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = _input[key] + "" }) // convert Input instances to Text

			User.signIn(_input).then(() => {
				this.props.flashMessage({ duration: 750, message: 'Sign in successful!' })
			}).catch((error) => {
				errors.push(error.message)
				this.setState({ working, errors })
			})
		} else {
			this.setState({ working, errors, input })
		}
	}

	render() {
		return (
			<CustomKeyboardAvoidingView>

				<Text testID='greetingMessage' style={styles.greeting}>{'Hello again 🕺🏾 💃🏾 \n Sign in to continue.'}</Text>

				<View style={styles.form}>
					<Text style={styles.input_label}>Email address</Text>
					<TextInput
						style={{ ...styles.input_field, borderBottomColor: this.state.input.email.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						keyboardType={'email-address'}
						autoCapitalize="none"
						onChangeText={email => this.handleInputChange('email', email)}
						value={this.state.input.email + ""}
						testID="emailField"
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

				<View style={styles.errors_field}
					testID='loginErrorText'
				>
					{this.state.errors.map((error, key) => (
						<Text key={key} style={styles.error}>• {error}</Text>
					))}
				</View>

				<TouchableOpacity
					style={styles.button}
					onPress={this.handleSubmit}
					disabled={this.state.working}
					testID="signInButton"
				>
					{this.state.working ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={{ color: '#FFF', fontWeight: '500' }}>Sign in</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={{ alignSelf: 'center', marginTop: 32, marginBottom: 50 }}
					onPress={() => this.props.navigation.navigate('SignUpScreen')}
					disabled={this.state.working}
					testID="signUpButtonAlt"
				>
					<Text testID='signUpOption' style={{ color: '#414959', fontSize: 13 }}>
						New here? <Text testID='signUpOption2' style={{ color: '#000', fontWeight: '700' }}>Sign up</Text>
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

export default connect(null, mapDispatchToProps)(SignInScreen);

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	greeting: {
		marginTop: 32,
		textAlign: 'center',
		fontSize: 18,
		fontWeight: '400',
		marginBottom: 50,
	},
	errors_field: {
		paddingBottom: 40,
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
		marginBottom: 40
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
	}
});
