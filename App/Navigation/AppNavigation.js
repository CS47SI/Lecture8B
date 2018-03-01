import { TabNavigator, StackNavigator } from 'react-navigation'
import React from 'react';
// import { Images, Colors, Metrics } from '../Themes'
// import { StyleSheet, Image } from 'react-native';
import HomeScreen from '../Screens/Home';
import TodoScreen from '../Screens/Todo';

const TodoLists = StackNavigator({
  HomeScreen: { screen: HomeScreen },
  TodoScreen: { screen: TodoScreen },
}, {
  // Default config for all screens
  headerMode: 'float',
  initialRouteName: 'HomeScreen',
})

export default TodoLists
