import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import SellerProductsListScreen from '../screens/common/lists/products-events-list.screen';
import SellerOrdersListScreen from '../screens/common/lists/orders-cart-list.screen';
import StoreSettingsScreen from '../screens/main-tabs-nav/profile/seller-area-nav/store-settings.screen';

const Stack = createStackNavigator();

const SellerProductsStack = () =>
	<Stack.Navigator initialRouteName="SellerProductsListScreen" screenOptions={{ headerBackTitleVisible: false }}>
		<Stack.Screen
			name="SellerProductsListScreen"
			component={SellerProductsListScreen}
			options={() => ({
				title: null,
				header: () => null
			})}
			initialParams={{ showing: 'from_seller_all' }}
		/>
	</Stack.Navigator>

const SellerOrdersStack = () =>
	<Stack.Navigator initialRouteName="SellerOrdersListScreen" screenOptions={{ headerBackTitleVisible: false }}>
		<Stack.Screen
			name="SellerOrdersListScreen"
			component={SellerOrdersListScreen}
			options={() => ({
				title: null,
				header: () => null
			})}
			initialParams={{ showing: "seller_received_orders" }}
		/>
	</Stack.Navigator>

const Tab = createMaterialTopTabNavigator();

const SellerAreaTabsNavigator = () =>
	<Tab.Navigator screenOptions={{ headerBackTitleVisible: false, tabBarStyle: { backgroundColor: '#f6f6f6' }, lazy:true }}>
		<Tab.Screen
			name="SellerProductsStack"
			component={SellerProductsStack}
			options={{
				title: 'Products'
			}}
		/>
		<Tab.Screen
			name="SellerOrdersStack"
			component={SellerOrdersStack}
			options={{
				title: 'Orders'
			}}
		/>
		<Tab.Screen
			name="StoreSettingsScreen"
			component={StoreSettingsScreen}
			options={{
				title: 'Settings'
			}}
		/>
	</Tab.Navigator>

export default SellerAreaTabsNavigator;
