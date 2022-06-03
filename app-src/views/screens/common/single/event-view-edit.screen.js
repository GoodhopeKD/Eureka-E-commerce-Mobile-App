import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash'

import { View, StyleSheet, ActivityIndicator, ScrollView, Text, Image, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from "react-native-elements";
//import RBSheet from "react-native-raw-bottom-sheet";
import DateTimePicker from 'react-native-date-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CustomKeyboardAvoidingView from '../../../components/custom-keyboard-avoiding-view.component';

import { User, Input, flashMessage, WEB_URL, SDateTime, SEvent, SDate, images_update_object_params } from '../../../../controller/index';

class EventViewEditScreen extends React.Component {

	screen_mode = 'view_existing' // create_new, edit_existing
	og_focused_event = null

	state = {
		focused_event: null,
		date_time_picker_visible: false,
		focused_event_read: false,
	}

	handleInputChange(field, value, use_as_is = false) {
		let input = this.state.input
		input[field] = (use_as_is) ? value : new Input(value)
		//if (this.state.date_time_picker_visible && this.date_time_picker_bottom_sheet)
		//this.date_time_picker_bottom_sheet.close()
		this.setState({ input, date_time_picker_visible: false, working: false, picking_images: false, capturing_images: false })
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
				this.handleInputChange('event_poster', { ...results.assets[0], name: results.assets[0].fileName }, true)
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
		let options = {
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 1,
			base64: false,
		}
		let callbackAction = (result) => {
			if (result && !result.cancelled) {
				this.handleInputChange('event_poster', { ...result, name: result.uri.split('/').slice(-1)[0] }, true)
			}
		}
		let result = null
		if (action == 'pick_images') {
			this.setState({ working: true, picking_images: true });
			result = await ImagePicker.launchImageLibraryAsync(options);
		} else {
			this.setState({ working: true, capturing_images: true })
			result = await ImagePicker.launchCameraAsync(options);
		}
		callbackAction(result)
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
                this.handleInputChange('event_poster', { ...result, name: result.uri.split('/').slice(-1)[0] }, true)
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

	loadFocusedElement = () => {
		setTimeout(async () => {
			if (this.props.route.params) {
				this.screen_mode = this.props.route.params.screen_mode
				const focused_event = this.props.route.params.focused_event ? _.cloneDeep(this.props.route.params.focused_event) : null

				switch (this.screen_mode) {
					case 'view_existing':
						this.setState({ working: false, focused_event });
						if (!this.state.focused_event || !this.state.focused_event_read) {
							await focused_event.read()
							this.setState({ focused_event, focused_event_read: true });
						}
						break;

					case 'edit_existing':
						if (!this.state.focused_event || !this.state.focused_event_read || !this.og_focused_event) {
							await focused_event.read()
							this.og_focused_event = focused_event
							this.setState({ focused_event, focused_event_read: true });
						}
						this.setState({
							working: false,
							input: {
								title: new Input(focused_event.title),
								description: new Input(focused_event.description),
								venue: new Input(focused_event.venue),
								contact_details: new Input(focused_event.contact_details),
								other_details: new Input(focused_event.other_details),
								event_datetime: focused_event.event_datetime,
								utc_offset: focused_event.utc_offset,
								event_poster: focused_event.event_poster,
								social_link_sitename: "facebook",
								social_link_username_url: 'eureka',
								event_date: new Date(focused_event.event_datetime.jsDate(focused_event.utc_offset)),
								event_time: new Date(focused_event.event_datetime.jsDate(focused_event.utc_offset)),
							},
							errors: [],
							using_time_now_confirmed: false,
							date_time_picker_mode: 'date',
							date_time_picker_visible: false,
						})
						break;

					case 'create_new':
						this.setState({
							working: false,
							input: {
								title: new Input(),
								description: new Input(),
								venue: new Input(),
								contact_details: new Input(),
								other_details: new Input(),
								event_datetime: new SDateTime(),
								utc_offset: null,
								event_poster: {},
								social_link_sitename: "facebook",
								social_link_username_url: 'eureka',
								event_date: new Date(),
								event_time: new Date(),
							},
							using_time_now_confirmed: false,
							date_time_picker_mode: 'date',
							date_time_picker_visible: false,
						})
						break;

					default:
						this.props.navigation.goBack()
						break;
				}
			}
		}, 0);
	};

	handleSubmit = async () => {
		this.setState({ working: true })
		let errors = []

		let { input } = this.state
		if (!input.title.isValid('name')) {
			errors.push("Invalid event title")
		}
		if (!input.description.isSafeText()) {
			if ((input.description + "")) {
				errors.push("Invalid characters found in description field")
			} else {
				errors.push("Description is required")
			}
		}
		if (!input.venue.isValid('name')) {
			errors.push("Invalid event venue")
		}
		if ((input.contact_details + "") && !input.contact_details.isSafeText()) {
			errors.push("Invalid characters found in contact details field")
		}
		if ((input.other_details + "") && !input.other_details.isSafeText()) {
			errors.push('Invalid characters found in "other details" field')
		}
		if (!input.event_poster.uri) {
			errors.push("Event poster is required")
		}
		if (errors.length === 0 && !this.state.using_time_now_confirmed && ((new SDate(input.event_date)) + "") == ((new SDate('today')) + "")) {
			this.setState({ using_time_now_confirmed: true })
			errors.push("Press submit again to confirm input of today's date")
		}

		if (errors.length === 0) {
			this.setState({ errors }) // Remove red lines under text inputs
			let _input = _.cloneDeep(input) // Dereference Input instance
			Object.keys(_input).forEach(key => { if (_input[key] instanceof Input) _input[key] = isNumeric(_input[key] + "") ? parseInt(_input[key]) : _input[key] + "" }) // convert Input instances to Text and Numbers

			const _time = !_input.utc_offset ? new Date('2021-08-27T00:00:00.000000Z') : _input.event_time
			_input.event_datetime = _input.event_date.toISOString().split('T')[0] + " " + (this.screen_mode == "edit_existing" ? (_input.event_datetime + "").split(' ')[1] : _time.toISOString().split('T')[1].split('.')[0])

			let callbackAction = () => { }
			let success_message = ""

			if (this.screen_mode == "edit_existing") {

				let images_update_object = JSON.parse(JSON.stringify(images_update_object_params))

				_input.event_poster.uri = _input.event_poster.uri.replace(WEB_URL, '')
				if (_input.event_poster.id !== this.og_focused_event.event_poster.id) {
					images_update_object.new_images_to_upload.push(_input.event_poster)
					images_update_object.images_to_refresh_in_db.push(this.og_focused_event.event_poster)
					images_update_object.old_images_to_delete_from_storage.push(this.og_focused_event.event_poster)
				}

				callbackAction = () => this.og_focused_event.update(_input, images_update_object)
				success_message = 'Update Successful'
			} else {
				callbackAction = () => SEvent.create(_input)
				success_message = 'Event has been posted and is now online'
			}

			callbackAction().then((response) => {
				this.props.flashMessage({ duration: 4000, message: success_message })
				const focused_event = (this.screen_mode == "edit_existing") ? this.og_focused_event : new SEvent(response)
				this.props.navigation.setParams({ screen_mode: "view_existing", focused_event });
				this.loadFocusedElement()
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

	componentDidMount = () => {
		this.loadFocusedElement();
	};

	render() {
		const auth_user = this.props.auth_user

		if (this.screen_mode == "view_existing") {
			if (!this.state.focused_event) return (
				<View style={{ alignItems: 'center', padding: 40 }}>
					<ActivityIndicator size="large" color="#E9446A" />
				</View>
			)

			const focused_event = this.state.focused_event

			return (
				<ScrollView showsVerticalScrollIndicator={false}>
					<Image source={focused_event.event_poster} style={styles.event_image} />

					<View style={styles.event_text}>
						<Text style={{ marginBottom: 25, fontSize: 24, fontWeight: "500", alignSelf: "center" }}>{focused_event.title}</Text>
						{this.state.focused_event_read ? (
							<>
								<Text style={{ fontSize: 16 }}>{focused_event.description}</Text>
								<Text style={{ paddingTop: 25, fontSize: 16, fontWeight: 'bold' }}>Venue:<Text style={{ fontSize: 16 }}> {focused_event.venue}</Text></Text>
								<Text style={{ paddingTop: 10, fontSize: 16, fontWeight: 'bold' }}>Contact Details: {focused_event.contact_details}</Text>
								<Text style={{ fontSize: 16 }}>{focused_event.other_details}</Text>
							</>
						) : (
							<View style={{ alignItems: 'center', padding: 40 }}>
								<ActivityIndicator size="large" color="#E9446A" />
							</View>
						)}
					</View>


					{(auth_user && auth_user.is_active_admin) &&
						<View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
							<View style={{ paddingTop: 20, flex: 1 }}>
								<TouchableOpacity
									style={styles.adminActionButton}
									onPress={() => {
										this.props.navigation.setParams({ screen_mode: "edit_existing", focused_event });
										this.loadFocusedElement()
									}}
								>
									{this.state.working ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.adminActionButtonText} >
											Edit details
										</Text>
									)}

								</TouchableOpacity>
							</View>
							<View style={{ paddingTop: 20, flex: 1 }}>
								<TouchableOpacity
									style={styles.adminDeleteButton}
									onPress={() => {
										Alert.alert(
											'Confirm',
											'Confirm Deleting Event',
											[
												{ text: 'No', onPress: () => { }, style: 'cancel' },
												{
													text: 'Yes',
													onPress: () => {
														this.setState({ working: true })
														focused_event.delete()
															.then(() => { this.props.flashMessage({ duration: 750, message: 'Event deleted' }); this.props.navigation.goBack() })
															.catch((error) => this.props.flashMessage({ duration: 750, message: error.message }))
													}
												}
											],
											{ cancelable: true }
										);
									}}
								>
									{this.state.working ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.adminDeleteButtonText} >
											Delete Event
										</Text>
									)}

								</TouchableOpacity>
							</View>
						</View>
					}
					<View style={{ height: 30 }}></View>
				</ScrollView>
			);
		}

		if (!this.state.input) return (
			<View style={{ alignItems: 'center', padding: 40 }}>
				<ActivityIndicator size="large" color="#E9446A" />
			</View>
		)

		/*const Date_time_picker_bottom_sheet_content = () => <View style={{ flex: 1, justifyContent: 'center' }}>
			{(this.state.date_time_picker_visible) && <DateTimePicker
				testID="dateTimePicker"
				value={this.state.input['event_' + this.state.date_time_picker_mode]}
				mode={this.state.date_time_picker_mode}
				display={Platform.OS == 'ios' ? "spinner" : 'default'}
				is24Hour={true}
				display="default"
				onChange={(event, datetime) => {
					if (datetime) {
						this.handleInputChange('event_' + this.state.date_time_picker_mode, datetime, true);
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
				<Image source={this.state.input.event_poster.uri ? this.state.input.event_poster : require('../../../../assets/general-img/jk-placeholder-image.jpg')} style={styles.event_image} />
				<TouchableOpacity style={styles.image_input} onPress={() => {
					this.load_images('pick_images')
				}}>
					<Ionicons name="ios-camera" size={40} />
					<Text style={{ paddingTop: 10, paddingLeft: 10, fontSize: 16 }}>{this.state.input.event_poster.uri ? "Replace" : "Set"} Poster</Text>
				</TouchableOpacity>

				<View style={styles.text_input_form}>
					<Text style={styles.input_label}>Title</Text>
					<TextInput style={{ ...styles.input_field, borderBottomColor: this.state.input.title.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						maxLength={64}
						onChangeText={title => this.handleInputChange('title', title)}
						value={this.state.input.title + ""}
					/>
				</View>

				<View style={styles.text_input_form}>
					<Text style={styles.input_label}>Description</Text>
					<TextInput
						style={{ ...styles.input_field, height: null, paddingVertical: 5, borderBottomColor: this.state.input.description.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						multiline={true}
						numberOfLines={1}
						maxHeight={160}
						maxLength={255}
						onChangeText={description => this.handleInputChange('description', description)}
						value={this.state.input.description + ""}
					/>
				</View>

				<View style={styles.text_input_form}>
					<Text style={styles.input_label}>Venue</Text>
					<TextInput style={{ ...styles.input_field, borderBottomColor: this.state.input.venue.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						maxLength={64}
						onChangeText={venue => this.handleInputChange('venue', venue)}
						value={this.state.input.venue + ""}
					/>
				</View>


				<View style={styles.datetime_input_form}>
					<Text style={styles.input_label}>Date</Text>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<View style={{ flex: 4 }}>
							<Text>{ucfirst((new SDateTime(this.state.input.event_date)).prettyDate())}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Button
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
					<Text style={styles.input_label}>Time (Optional)</Text>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<View style={{ flex: 5 }}>
							<Text>{this.state.input.utc_offset ? ucfirst((new SDateTime(this.state.input.event_time)).prettyTime()) + ' (GMT' + this.state.input.utc_offset + ')' : ''}</Text>
						</View>
						<View style={{ flex: 3 }}>
							<Button
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

				<DateTimePicker
					modal
					title={null}
					open={this.state.date_time_picker_visible}
					mode={this.state.date_time_picker_mode}
					date={this.state.input['event_' + this.state.date_time_picker_mode]}
					onConfirm={(datetime) => {
						this.handleInputChange('event_' + this.state.date_time_picker_mode, datetime, true);
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

				<View style={styles.text_input_form}>
					<Text style={styles.input_label}>Contact details (Optional)</Text>
					<TextInput
						style={{ ...styles.input_field, height: null, paddingVertical: 5, borderBottomColor: this.state.input.contact_details.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						multiline={true}
						numberOfLines={1}
						maxHeight={160}
						maxLength={255}
						onChangeText={contact_details => this.handleInputChange('contact_details', contact_details)}
						value={this.state.input.contact_details + ""}
					/>
				</View>

				<View style={styles.text_input_form}>
					<Text style={styles.input_label}>Other details (Optional)</Text>
					<TextInput
						style={{ ...styles.input_field, height: null, paddingVertical: 5, borderBottomColor: this.state.input.other_details.hasError() ? 'red' : styles.input_field.borderBottomColor }}
						autoCapitalize="none"
						multiline={true}
						numberOfLines={1}
						maxHeight={160}
						maxLength={255}
						onChangeText={other_details => this.handleInputChange('other_details', other_details)}
						value={this.state.input.other_details + ""}
					/>
				</View>

				{(this.state.errors && this.state.errors.length) ? (
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
							Publish
						</Text>
					)}
				</TouchableOpacity>
			</CustomKeyboardAvoidingView>
		)
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

export default connect(mapStateToProps, mapDispatchToProps)(EventViewEditScreen);

const styles = StyleSheet.create({
	image_input: {
		marginVertical: 20,
		marginHorizontal: 30,
		flexDirection: "row",
	},
	adminActionButton: {
		backgroundColor: '#fff',
		borderColor: '#000',
		borderWidth: 1,
		borderRadius: 10,
		marginHorizontal: 10,
		height: 60,
		flex: 1,
		justifyContent: 'center'
	},
	adminActionButtonText: {
		color: '#000',
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	adminDeleteButton: {
		backgroundColor: '#E9446A',
		borderColor: '#000',
		borderRadius: 10,
		marginHorizontal: 10,
		height: 60,
		flex: 1,
		justifyContent: 'center'
	},
	adminDeleteButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	event_image: {
		width: '100%',
		height: 450
	},
	event_text: {
		marginVertical: 15,
		marginHorizontal: 10
	},
	errors_field: {
		paddingTop: 10,
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
	text_input_form: {
		marginHorizontal: 30,
		marginBottom: 30,
		marginTop: 20
	},
	datetime_input_form: {
		marginHorizontal: 30,
		marginBottom: 30,
		marginTop: 20,
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