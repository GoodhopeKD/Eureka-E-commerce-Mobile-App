import React from 'react';
import { connect } from "react-redux";
import RnBgTask from 'react-native-bg-thread';

import { Alert } from 'react-native';

import { User, flashMessage } from '../../controller/index'

class MergePinsPrompt extends React.Component {

	shown = false

	prompt = () => {
		if (!this.props.auth_user && this.shown) {
			this.shown = false
		}
		if (this.props.auth_user && !this.shown) {
			const bgTask = () => setTimeout(() => {
				if (this.props.local_pins.length) {
					Alert.alert(
						'Merge Prompt',
						'A list of favourite products and cart products was found on your local storage. Would you like to merge the data with that on your profile?',
						[
							{ text: 'No', onPress: () => { this.props.clearLocalPins() }, style: 'cancel' },
							{
								text: 'Yes',
								onPress: () => {
									const bgTask = () => {
										this.props.auth_user.mergePins(this.props.local_pins)
											.then(() => this.props.flashMessage({ duration: 750, message: 'Data merged' }))
											.catch(() => this.props.flashMessage({ duration: 750, message: 'An error occured' }))
											.finally(() => this.props.clearLocalPins())
									}
									try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
								}
							}
						],
						{ cancelable: true }
					);
				}
			}, 2000)
			try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
			this.shown = true
		}
	}

	render() {
		this.prompt()
		return null;
	}
}

const mapStateToProps = (state) => {
	return {
		auth_user: state.auth_user_data ? new User(state.auth_user_data) : null,
		local_pins: state.local_pins_collection.data,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		clearLocalPins: () => dispatch({ type: 'LOCAL_PINS_CLEAR_ALL' }),
		flashMessage: (params) => dispatch(flashMessage(params))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(MergePinsPrompt);
