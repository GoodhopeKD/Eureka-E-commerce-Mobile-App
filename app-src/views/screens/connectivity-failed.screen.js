import React from "react";
import { useNetInfo } from "@react-native-community/netinfo";

import { ImageBackground, TouchableOpacity, Text, View, StyleSheet, Image, SafeAreaView } from 'react-native';

const ConnectivityFailedScreen = ({ connectivityBoot }) => {

    const netInfo = useNetInfo();

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground
                source={require('../../assets/splash.png')}
                resizeMode="contain"
                backgroundColor="#fff"
                imageStyle={{ width: '100%' }}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.95)", }} >
                    <View style={{ ...styles.content_container, flex: 2 }} >
                        {netInfo.isConnected ? (
                            <>
                                <Text style={styles.text}>
                                    A connection couldn't be established with the backend server.
                                </Text>
                                <Text style={styles.text}>
                                    Try again later and notify us if the problem persists.
                                </Text>
                                <Text style={styles.text}>
                                    We apologize for the inconveniences caused.
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.text}>
                                    An active internet connection is required.
                                </Text>
                                <Text style={styles.text}>
                                    Ensure that you're connected to the internet and retry.
                                </Text>
                            </>
                        )}
                    </View>
                    <View style={styles.content_container}></View>
                    <View style={{ flex: 1, alignItems: "center", }} >
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#E9446A',
                                borderRadius: 15,
                                height: 50,
                                width: 200,
                                justifyContent: 'center'
                            }}
                            onPress={connectivityBoot}
                        >
                            <Text
                                style={{
                                    color: 'white',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}
                            >
                                Retry
				            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.content_container}>
                        <Image source={require('../../assets/general-img/pawpaw.png')} style={{ height: 165, width: 165 }} />
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default ConnectivityFailedScreen;

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'center',
    },
    content_container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    }
});

