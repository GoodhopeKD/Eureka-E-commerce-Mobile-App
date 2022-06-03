import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default class StoreLoopComponent extends React.PureComponent {
	render() {
		const focused_store = this.props.store;
		return (
			<TouchableOpacity style={{ flex: 1 }} onPress={this.props.onPress} >
				<View style={{paddingHorizontal:20, height: 200, marginTop: 20 }}>
					<Text style={{ fontSize: 20, fontWeight: 'bold' }}>{focused_store.name}</Text>
					<Image
						source={focused_store.banner_image}
						style={{
							flex: 1,
							marginTop: 5,
							height: null,
							width: null,
							resizeMode: 'cover',
							borderRadius: 10,
							borderWidth: 1,
							borderColor: '#dddddd'
						}}
					/>
				</View>
			</TouchableOpacity>
		);
	}
}
