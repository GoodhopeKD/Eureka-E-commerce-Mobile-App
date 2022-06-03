import React from "react";

import { ImageBackground, View, ActivityIndicator } from 'react-native';

const SplashScreen = () => {

	const [showing_indicator, setShowingIndicator] = React.useState(false);

	React.useEffect(() => {
		let indicator_timeout_handle = setTimeout(() => {
			setShowingIndicator(true)
		}, 3000);
		return () => {
			clearTimeout(indicator_timeout_handle);
		};
	}, []);

	return (
		<ImageBackground
			source={require('../../assets/splash.png')}
			resizeMode="contain"
			backgroundColor="#fff"
			imageStyle={{ width: '100%' }}
			style={{ flex: 1 }}
		>
			{showing_indicator && (
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "rgba(255,255,255,0.9)",
					}}
				>
					<ActivityIndicator size="large" color="#E9446A" />
				</View>
			)}
		</ImageBackground>
	);
};

export default SplashScreen;
