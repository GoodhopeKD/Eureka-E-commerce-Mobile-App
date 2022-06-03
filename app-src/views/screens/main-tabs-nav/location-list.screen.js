import React, { Component } from 'react';
import { connect } from "react-redux";

import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Platform } from 'react-native';

class LocationListScreen extends Component {

    state = {
        wilayas: [],
        items_loaded: false
    }

    open_product_browser = (wilaya_name) => {
        this.props.navigation.navigate("ProductsEventsListScreen", { showing: "items_from_location", title: wilaya_name, location_name: wilaya_name })
    }

    componentDidMount = () => {
        setTimeout(() => {
            const wilayas = [
                { name: 'Alger', image: require('../../../assets/wilaya-img/alger.jpg') },
                { name: 'Annaba', image: require('../../../assets/wilaya-img/annaba.jpg') },
                { name: 'Blida', image: require('../../../assets/wilaya-img/blida.jpg') },
                { name: 'Tizi Ouzou', image: require('../../../assets/wilaya-img/tizi.jpg') },
                { name: 'Béjaïa', image: require('../../../assets/wilaya-img/bja.jpg') },
                { name: 'Sidi Bel Abbès', image: require('../../../assets/wilaya-img/sidi-bel-abbes.jpg') },
                { name: 'Oran', image: require('../../../assets/wilaya-img/oran.jpg') },
                { name: 'Constantine', image: require('../../../assets/wilaya-img/consta.jpg') },
                { name: 'Tlemcen', image: require('../../../assets/wilaya-img/tlemcen.jpg') },
                { name: 'Mostaganem', image: require('../../../assets/wilaya-img/mostaganem.jpg') },
            ]
            this.setState({ wilayas, items_loaded: true })
        }, 0)
    }

    render() {

        const wilayas = this.state.wilayas
        let output_pairs = []

        for (let index = 0; index < wilayas.length; index++) {
            if (wilayas[index]) {

                output_pairs.push(
                    <View style={{
                        flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 10,
                        justifyContent: 'space-between'
                    }}>
                        <TouchableOpacity onPress={() => this.open_product_browser(wilayas[index - 1].name)}>
                            <View style={{ height: 210, width: 160, borderRadius: 10, marginHorizontal: 5 }}>
                                <ImageBackground source={wilayas[index].image} imageStyle={{ borderRadius: 20 }}
                                    style={styles.imgContainer}>
                                    <View style={styles.layout}>
                                        <Text style={styles.imgTxt}>
                                            {wilayas[index].name}
                                        </Text>
                                    </View>
                                </ImageBackground>
                            </View>
                        </TouchableOpacity>

                        {(wilayas[index + 1]) &&
                            <TouchableOpacity onPress={() => this.open_product_browser(wilayas[index].name)}>
                                <View style={{ height: 210, width: 160, borderRadius: 10, marginHorizontal: 5 }}>
                                    <ImageBackground source={wilayas[index + 1].image} imageStyle={{ borderRadius: 20 }}
                                        style={styles.imgContainer}>
                                        <View style={styles.layout}>
                                            <Text style={styles.imgTxt}>
                                                {wilayas[index + 1].name}
                                            </Text>
                                        </View>
                                    </ImageBackground>
                                </View>
                            </TouchableOpacity>
                        }

                    </View>
                )
            }
            index++
        }

        return (
            <ScrollView>
                {output_pairs.map((wilaya_pair, key) => {
                    return <View key={key}>{wilaya_pair}</View>;
                })}
            </ScrollView>
        )

    }
}

const styles = StyleSheet.create({
    header: {
        height: Platform.OS === 'android' ? 60 : 40,
        alignItems: 'center',
        borderBottomColor: '#dddddd',
        borderBottomWidth: 1
    },
    imgContainer: {
        flex: 1,
        height: null,
        width: null,
        resizeMode: 'cover'
    },
    layout: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, .4)',
        borderRadius: 20,
    },
    imgTxt: {
        color: 'white',
        textAlign: 'center',
        fontSize: 23,
        fontWeight: 'bold',
        paddingTop: 85,
    },
});

const mapStateToProps = (state) => {
    return {
        system_status_data: state.system_status_data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        //set_products_events_browser_screen_params : (showing,title) => dispatch({ type: "SET_PRODUCTS_EVENTS_BROWSER_PARAMS", products_events_browser_screen_params:{ showing, title }}),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationListScreen);