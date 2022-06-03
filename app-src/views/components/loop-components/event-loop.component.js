import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

class EventLoopComponent extends React.PureComponent {
	render() {
		const focused_event = this.props.event;
		return (
			<TouchableOpacity style={{ flex: 1 }} onPress={this.props.onPress} >
				<View style={{ flex: 1 }}>
					<View style={styles.feedItem}>
						<Image source={focused_event.event_poster} style={styles.avatar} />
						<View style={{ flex: 1, justifyContent: 'center' }}>
							<View
								style={{
									flexDirection: 'column',
									justifyContent: 'space-between',
									alignItems: 'flex-start'
								}}
							>
								<Text style={styles.name}>{focused_event.title}</Text>
								<Text style={styles.date}>{ucfirst(focused_event.display_datetime)}</Text>
							</View>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

export default EventLoopComponent;

const styles = StyleSheet.create({
	feedItem: {
		backgroundColor: '#fff',
		padding: 10,
		flexDirection: 'row',
		marginTop: 10,
		marginHorizontal: 2,
		borderWidth: 1,
		borderColor: '#ddd'
	},
	avatar: {
		width: 90,
		height: 90,
		marginLeft: 7,
		marginRight: 20
	},
	name: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	date: {
		fontSize: 16,
		paddingTop: 7
	}
});
