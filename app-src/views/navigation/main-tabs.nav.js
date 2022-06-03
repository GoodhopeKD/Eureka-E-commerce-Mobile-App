import React from 'react';

import { SafeAreaView, View } from "react-native";
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Toolbar } from 'react-native-material-ui';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ProfileKebabMenuNav from './profile-kebab-menu.nav'
import HomeScreen from '../screens/main-tabs-nav/home.screen'
import LocationListScreen from '../screens/main-tabs-nav/location-list.screen'
import ProductsEventsListScreen from '../screens/common/lists/products-events-list.screen'
import CartListScreen from '../screens/common/lists/orders-cart-list.screen'
import ProfileScreen from '../screens/main-tabs-nav/profile.screen'

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const HomeTabStack = () => {

    const [query_string, set_query_string] = React.useState('');

    return (<Stack.Navigator screenOptions={{ headerBackTitleVisible: false }} >
        <Stack.Screen name="HomeTabStack" component={HomeScreen}
            options={({ navigation }) => ({
                header: () => (
                    <SafeAreaView>
                        <Toolbar
                            centerElement="Search"
                            searchable={{
                                autoFocus: true,
                                placeholder: 'Find Products or Events',
                                onChangeText: (query_string) => { set_query_string(query_string) },
                                onSubmitEditing: () => {
                                    if (query_string) navigation.navigate('ProductsEventsListScreen', { showing: "search_results", title: "Search Results", query_string })
                                }
                            }}
                            style={{
                                container: {
                                    backgroundColor: "#fff",
                                },
                                titleText: {
                                    color: "#333"
                                },
                                leftElement: {
                                    color: "#333",
                                },
                                rightElement: {
                                    color: "#333"
                                }
                            }}
                        />
                    </SafeAreaView>
                ),
            })}
        />
    </Stack.Navigator>)
}

const LocationListTabStack = () =>
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }} >
        <Stack.Screen name="LocationListTabStack" component={LocationListScreen}
            options={{
                headerTitle: 'Location',
                headerTitleAlign: 'center',
            }}
        />
    </Stack.Navigator>

const EventsListTabStack = () =>
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }} >
        <Stack.Screen name="EventsListTabStack" component={ProductsEventsListScreen}
            options={{
                headerTitle: 'Events',
                headerTitleAlign: 'center',
            }}
            initialParams={{ showing: "events" }}
        />
    </Stack.Navigator>

const CartListTabStack = () =>
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }} >
        <Stack.Screen name="CartListTabStack" component={CartListScreen}
            options={{
                headerTitle: 'Cart',
                headerTitleAlign: 'center',
            }}
            initialParams={{ showing: "cart_pins" }}
        />
    </Stack.Navigator>

const ProfileTabStack = () =>
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }} >
        <Stack.Screen name="ProfileTabStack" component={ProfileScreen}
            options={({ navigation }) => ({
                headerTitle: 'Profile',
                headerTitleAlign: 'center',
                headerLeft: () => <View />,
                headerRight: () => <View style={{ marginRight: 8 }}><ProfileKebabMenuNav navigation={navigation} /></View>,
                tabBarLabel: null,
            })}
        />
    </Stack.Navigator>

const MainTabsNav = () =>
    <Tab.Navigator initialRouteName="HomeTab" inactiveColor="grey" activeColor="red" barStyle={{ backgroundColor: '#fff' }} screenOptions={{ headerBackTitleVisible: false }} >
        <Tab.Screen name="HomeTab" component={HomeTabStack}
            options={{
                tabBarLabel: null,
                tabBarIcon: ({ color }) => (
                    <View>
                        <Ionicons name={'ios-home'} size={24} style={{ color }} />
                    </View>
                ),
            }}
        />
        <Tab.Screen name="LocationListTab" component={LocationListTabStack}
            options={{
                tabBarLabel: null,
                tabBarIcon: ({ color }) => (
                    <View>
                        <Ionicons name={'ios-compass'} size={24} style={{ color }} />
                    </View>
                ),
            }}
        />
        <Tab.Screen name="EventsListTab" component={EventsListTabStack}
            options={{
                tabBarLabel: null,
                tabBarIcon: ({ color }) => (
                    <View>
                        <Ionicons name={'ios-calendar'} size={24} style={{ color }} />
                    </View>
                ),
            }}
        />
        <Tab.Screen name="CartListTab" component={CartListTabStack}
            options={{
                tabBarLabel: null,
                tabBarIcon: ({ color }) => (
                    <View>
                        <Ionicons name={'ios-cart'} size={24} style={{ color }} />
                    </View>
                ),
            }}
        />
        <Tab.Screen name="ProfileTab" component={ProfileTabStack}
            options={{
                tabBarLabel: null,
                tabBarIcon: ({ color }) => (
                    <View>
                        <Ionicons name={'ios-person'} size={24} style={{ color }} />
                    </View>
                ),
            }}
        />
    </Tab.Navigator>

export default MainTabsNav