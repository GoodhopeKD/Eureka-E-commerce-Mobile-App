import React from 'react';
import { connect } from 'react-redux';

import { View, Text, SectionList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import PhonesViewEdit from '../../../components/phones-view-edit.component'
import { User, flashMessage, Input, AddressResource } from '../../../../controller/index';

class MyDetailsScreen extends React.Component {

	state = {
		working: false,
		input: {
			surname: new Input(this.props.auth_user.surname),
			name_s: new Input(this.props.auth_user.name_s),
			username: new Input(this.props.auth_user.username),
			email: new Input(this.props.auth_user.email),
		},
		errors: [],
		input_fields_element_open_state: []
	}

	resetState() {
		this.setState({
			working: false,
			input: {
				surname: new Input(this.props.auth_user.surname),
				name_s: new Input(this.props.auth_user.name_s),
				username: new Input(this.props.auth_user.username),
				email: new Input(this.props.auth_user.email),
			},
			errors: [],
			input_fields_element_open_state: []
		})
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

		if (input_field_name == "surname" && !input.surname.isValid('name')) {
			errors.push("Invalid surname")
		} else {
			input.surname.overrideError()
		}

		if (input_field_name == "name_s" && !input.name_s.isValid('name')) {
			errors.push("Invalid name(s)")
		} else {
			input.name_s.overrideError()
		}

		if (input_field_name == "username" && !input.username.isValid('username')) {
			errors.push("Invalid username")
		} else {
			input.username.overrideError()
		}

		if (input_field_name == "email" && !input.email.isValid('email')) {
			errors.push("Invalid email")
		} else {
			input.email.overrideError()
		}

		if (input_field_name == "number") {
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
		}

		if (errors.length === 0) {
			this.setState({ errors }) // Remove red lines under text inputs
			let _input = Object.assign(Object.create(Object.getPrototypeOf(input)), input) // Dereference Input instance
			Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = isNumeric(_input[key] + "") ? parseInt(_input[key]) : _input[key] + "" }) // convert Input instances to Text and Numbers

			const auth_user = this.props.auth_user
			let update_data = {}
			update_data[input_field_name] = _input[input_field_name]
			let callbackAction = () => auth_user.update(update_data)

			callbackAction().then(() => {
				this.toggleInputFieldState(input_field_name, false)
				this.props.flashMessage({ duration: 4000, message: "Profile data updated" })
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

		const address = auth_user.address ? auth_user.address : AddressResource

		const sections_list = [
			{
				title: "Profile",
				inline_edit:true,
				data: [
					{
						option_name: "Surname",
						value: auth_user.surname,
						input_field_name: 'surname',
					},
					{
						option_name: "Name(s)",
						value: auth_user.name_s,
						input_field_name: 'name_s',
					},
					{
						option_name: "Username",
						value: auth_user.username,
						input_field_name: 'username',
					},
					{
						option_name: "Email",
						value: auth_user.email,
						icon_name: "email-edit-outline",
						input_field_name: 'email',
					},
				]
			},
			{
				title: "Address",
				onPress: () => this.props.navigation.navigate('AddressEditScreen', { nav_context: 'my-details-screen' }),
				data: [
					{ option_name: "Last name", value: address.surname },
					{ option_name: "Name(s)", value: address.name_s },
					{ option_name: "Address line 1", value: address.address_line_one },
					{ option_name: "Address line 2", value: address.address_line_two },
					{ option_name: "Postal Code", value: address.postal_code },
					{ option_name: "City (Commune)", value: address.commune },
					{ option_name: "Wilaya", value: address.wilaya },
				]
			},
			{
				is_complete_component: true,
				data: []
			}
		]

		return (
			<View style={{ flex: 1 }}>
				<SectionList
					sections={sections_list}
					keyExtractor={(item, index) => item + index}
					showsVerticalScrollIndicator={false}
					stickySectionHeadersEnabled={false}
					style={{ flex: 1, margin: 10 }}
					initialNumToRender={15}
					renderSectionHeader={({ section }) => {
						if (section.is_complete_component) return <PhonesViewEdit auth_user={auth_user} navigation={this.props.navigation} nav_context="my-details-screen" />
						return (<View style={{ marginTop: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
							<View style={{ flex: 1 }}><Text style={{ fontWeight: 'bold', fontSize: 20, }}>{section.title}</Text></View>
							{(!section.inline_edit) && <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 5 }}>
								<TouchableOpacity onPress={section.onPress} style={{ height: 35, width: 70, backgroundColor: '#E9446A', justifyContent: 'center', borderRadius: 5 }}><Text style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Modify</Text></TouchableOpacity>
							</View>}
						</View>)
					}}
					renderSectionFooter={({ section }) => {
						if (section.is_complete_component) return null
						return (this.state.errors.length) ?
							<View style={styles.errors_field}>
								{this.state.errors.map((error, key) => (
									<Text key={key} style={styles.error}>• {error}</Text>
								))}
							</View>
							: null
					}
					}
					renderItem={({ item, section }) => {
						if (section.is_complete_component) return null

						const element = this.state.input_fields_element_open_state.find((element) => element.input_field_name == item.input_field_name)
						const input_field_element_open_state = element ? element.open_state : false
						let keyboard_type = 'default'
						let placeholder = item.option_name
						if (item.input_field_name == 'email') keyboard_type = 'email-address'

						return (
							<ListItem /* containerStyle={{  borderRadius: 10 }} */ >
								<ListItem.Content>
									<ListItem.Title style={{ fontSize: 16.5 }} >
										{item.option_name}
									</ListItem.Title>
								</ListItem.Content>
								{input_field_element_open_state ? (
									<View style={{ flex: 2, flexDirection: 'row' }}>
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
								{(section.inline_edit) ? (
									<TouchableOpacity onPress={() => this.toggleInputFieldState(item.input_field_name, !input_field_element_open_state)}>
										<MaterialCommunityIcons
											name={(input_field_element_open_state) ? 'cancel' : item.icon_name ? item.icon_name : 'square-edit-outline'}
											color={'#E9446A'}
											size={22}
										/>
									</TouchableOpacity>
								) : null}
							</ListItem>
						);
					}}
				/>
			</View>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data, ['address', 'phones']) : null,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		flashMessage: (params) => dispatch(flashMessage(params))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(MyDetailsScreen);


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