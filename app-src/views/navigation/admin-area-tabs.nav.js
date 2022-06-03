import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import AdminProductsEventsListScreen from '../screens/common/lists/products-events-list.screen';
import AdminOrdersListScreen from '../screens/common/lists/orders-cart-list.screen'

const Stack = createStackNavigator();

const AdminProductsStack = () =>
	<Stack.Navigator initialRouteName="AdminProductsScreen" screenOptions={{ headerBackTitleVisible: false }}>
		<Stack.Screen
			name="AdminProductsScreen"
			component={AdminProductsEventsListScreen}
			options={() => ({
				title: null,
				header: () => null
			})}
			initialParams={{ showing: 'admin_products_action_list' }}
		/>
	</Stack.Navigator>

const AdminOrdersStack = () =>
	<Stack.Navigator initialRouteName="AdminOrdersListScreen" screenOptions={{ headerBackTitleVisible: false }}>
		<Stack.Screen
			name="AdminOrdersListScreen"
			component={AdminOrdersListScreen}
			options={() => ({
				title: null,
				header: () => null
			})}
			initialParams={{ showing: "admin_orders_management_list" }}
		/>
	</Stack.Navigator>

const Tab = createMaterialTopTabNavigator();

const AdminAreaTabsNavigator = () =>
	<Tab.Navigator screenOptions={{ headerBackTitleVisible: false, tabBarStyle: { backgroundColor: '#f6f6f6' }, lazy:true }}>
		<Tab.Screen
			name="AdminProductsStack"
			component={AdminProductsStack}
			options={{
				title: 'Products'
			}}
		/>
		<Tab.Screen
			name="AdminOrdersStack"
			component={AdminOrdersStack}
			options={{
				title: 'Orders'
			}}
		/>
	</Tab.Navigator>

export default AdminAreaTabsNavigator;
