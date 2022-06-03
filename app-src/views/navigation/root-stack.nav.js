import React from 'react';
import { connect } from "react-redux";

import { createStackNavigator } from '@react-navigation/stack';

import { connectivityBoot, User } from '../../controller/index'

import MainTabsNav from './main-tabs.nav'
import SellerAreaTabsNav from './seller-area-tabs.nav'
import AdminAreaTabsNav from './admin-area-tabs.nav'

import SignInScreen from '../screens/auth/signin.screen'
import SignUpScreen from '../screens/auth/signup.screen'
import PasswordResetScreen from '../screens/auth/password-reset.screen'


import MyDetailsScreen from '../screens/main-tabs-nav/profile/my-details-screen'
import CustomerServiceScreen from '../screens/main-tabs-nav/profile/customer-service.screen'
import AddressEditScreen from '../screens/common/address-edit.screen'

/* Common Screens */
import StoresListScreen from '../screens/common/lists/stores-list.screen'
import ProductsEventsListScreen from '../screens/common/lists/products-events-list.screen'
import UserOrdersListScreen from '../screens/common/lists/orders-cart-list.screen'
import ProductCartViewScreen from '../screens/common/single/product-cart-view.screen'
import ProductEditScreen from '../screens/common/single/product-edit.screen'
import EventViewEditScreen from '../screens/common/single/event-view-edit.screen'
import OrderViewEditScreen from '../screens/common/single/order-view-edit.screen'
import CheckoutScreen from '../screens/common/checkout.screen'

import SplashScreen from '../screens/splash.screen';
import ConnectivityFailedScreen from '../screens/connectivity-failed.screen';

const Stack = createStackNavigator();

const RootStackNav = (props) => {

    // Boot
    React.useEffect(() => {
        props.connectivityBoot();
    }, []);

    // Still booting, show splash
    if (props.connectivity === null)
        return <SplashScreen />

    // connectivity failed
    if (props.connectivity === false)
        return <ConnectivityFailedScreen connectivityBoot={props.connectivityBoot} />

    return (
        <Stack.Navigator initialRouteName="MainTabsNav" screenOptions={{ headerBackTitleVisible: false }} >

            <Stack.Screen name="MainTabsNav" component={MainTabsNav}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen name="StoresListScreen" component={StoresListScreen}
                options={{
                    title: "Stores",
                    headerTitleAlign: 'center',
                }}
            />
            <Stack.Screen name="ProductsEventsListScreen" component={ProductsEventsListScreen}
                options={({ route }) => ({
                    title: route.params.title,
                    headerTitleAlign: 'center'
                })}
            />
            <Stack.Screen name="ProductCartViewScreen" component={ProductCartViewScreen}
                options={({ route }) => ({
                    title: (route.params && route.params.title) ? (route.params.title.length > 35) ? route.params.title.substring(0, 33) + "..." : route.params.title : "Product",
                    headerTitleAlign: 'center'
                })}
            />
            <Stack.Screen name="EventViewEditScreen" component={EventViewEditScreen}
                options={({ route }) => ({
                    title: route.params.title,
                    headerTitleAlign: 'center'
                })}
            />
            <Stack.Screen name="CheckoutScreen" component={CheckoutScreen}
                options={{
                    title: "Checkout",
                    headerTitleAlign: 'center',
                }}
            />

            {props.auth_user && <>
                <Stack.Screen name="UserOrdersListScreen" component={UserOrdersListScreen}
                    options={{
                        title: "My orders",
                        headerTitleAlign: 'center',
                    }}
                    initialParams={{ showing: "user_placed_orders" }}
                />
                <Stack.Screen name="OrderViewEditScreen" component={OrderViewEditScreen}
                    options={({ route }) => ({
                        title: route.params.title,
                        headerTitleAlign: 'center'
                    })}
                />
                <Stack.Screen name="MyDetailsScreen" component={MyDetailsScreen}
                    options={{
                        title: "My details",
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen name="AddressEditScreen" component={AddressEditScreen}
                    options={({ route }) => ({
                        title: route.params.nav_context == 'my-details-screen' ? 'My Address' : 'Delivery address',
                        headerTitleAlign: 'center'
                    })}
                />
                <Stack.Screen name="ProductEditScreen" component={ProductEditScreen}
                    options={{
                        title: "Product details",
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen name="SellerAreaTabsNav" component={SellerAreaTabsNav}
                    options={{
                        title: "Seller area",
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen name="AdminAreaTabsNav" component={AdminAreaTabsNav}
                    options={{
                        title: "Admin",
                        headerTitleAlign: 'center',
                    }}
                />
            </>}

            <Stack.Screen name="CustomerServiceScreen" component={CustomerServiceScreen}
                options={{
                    title: "Customer service",
                    headerTitleAlign: 'center',
                }}
            />

            {!props.auth_user && <>
                <Stack.Screen name="SignInScreen" component={SignInScreen}
                    options={{
                        title: 'Sign in',
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen name="SignUpScreen" component={SignUpScreen}
                    options={{
                        title: 'Sign up',
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen name="PasswordResetScreen" component={PasswordResetScreen}
                    options={{
                        title: 'Reset password',
                        headerTitleAlign: 'center',
                    }}
                />
            </>}

        </Stack.Navigator>
    );
}

const mapStateToProps = (state) => {
    return {
        auth_user: state.auth_user_data ? new User(state.auth_user_data) : null,
        connectivity: state.system_status_data.connectivity
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        connectivityBoot: () => dispatch(connectivityBoot()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RootStackNav);