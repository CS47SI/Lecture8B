/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  FlatList,
  TextInput,
  Button,
  Animated,
  TouchableOpacity
} from 'react-native';

import { Metrics, Colors } from "../Themes"
import Realm from 'realm';

export default class Todo extends Component {

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: navigation.state.params.listName
    }
  }

  state = {
    realm: null,
    realmList: null,
    tasks: [{value: "test"}],
    text: "",
    opacity: []
  };

  readFromRealm = async () => {
    var params = this.props.navigation.state.params;
    var realmList = params.tasks;
    var temp = [];
    realmList.forEach(item => {
      temp.push(item);
      this.state.opacity.push(new Animated.Value(1));
    });
    this.setState({realmList: realmList, tasks: temp, realm: params.realm});
  }

  componentWillMount() {
    this.readFromRealm();
  }

  delete = async (item, index) => {
    // this.state.realmList.filtered('value = "'+item.value+'"')
    if (!item.completed) {
      await this.state.realm.write(() => {
        item.completed = true;
      });
      this.readFromRealm();
    } else {
      await this.state.realm.write(() => {
        this.state.realm.delete(item);
      });
      Animated.timing(                  // Animate over time
        this.state.opacity[index],            // The animated value to drive
        {
          toValue: 0,                   // Animate to opacity: 1 (opaque)
          duration: 1000,              // Make it take a while
        }
      ).start(async () => {
        var temp = this.state.opacity.slice();
        temp.splice(index, 1);
        await this.setState({opacity: temp, tasks: []});
        this.readFromRealm();
      });                        // Starts the animation
    }
  }

  _renderItem = (item, index) => {
    return (
      <TouchableOpacity onPress={() => this.delete(item, index)}>
        <Animated.View style={[styles.task,{opacity: this.state.opacity[index]}]}>
            <Text style={item.completed ? [styles.taskText, styles.taskComplete] : styles.taskText}> {item.value} </Text>
        </Animated.View>
      </TouchableOpacity>
    )
  }

  add = () => {
    this.state.realm.write(() => {
      this.state.realmList.push({value: this.state.text, completed: false});
      this.readFromRealm();
      this.setState({text: ""})
    })
  }


  render() {


    return (
      <KeyboardAvoidingView style={styles.container}
      behavior={"padding"}
      keyboardVerticalOffset={64}>
        <FlatList
          data={this.state.tasks}
          renderItem={({item, index}) => this._renderItem(item,index)}
          style={{flex: 1, width: '100%'}}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.newTodoItem}>
          <TextInput
            style={styles.newItem}
            value={this.state.text}
            onChangeText={(text) => this.setState({text})}
            placeholder="Add a new item..."/>
          <Button
            title="Add"
            onPress={this.add}/>
        </View>

      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  newTodoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: Metrics.doubleBaseMargin,
    paddingRight: Metrics.doubleBaseMargin,
    borderTopWidth: Metrics.horizontalLineHeight,
    paddingBottom: Metrics.marginVertical,
    paddingTop: Metrics.marginVertical
  },
  newItem: {
    borderBottomWidth: Metrics.horizontalLineHeight,
    flex: 1,
    borderBottomColor: Colors.border,
    marginRight: Metrics.marginHorizontal,
    fontSize: 16,
    fontFamily: "Helvetica Neue"
  },
  task: {
    flexDirection: 'row',
    marginTop: Metrics.marginVertical,
    marginLeft: Metrics.marginVertical*2,
    marginRight: Metrics.marginVertical*2,
    paddingTop: Metrics.marginVertical,
    paddingBottom: Metrics.marginVertical,
    paddingLeft: Metrics.marginVertical,
    justifyContent: 'flex-start',
    backgroundColor: '#34495e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 1,
    borderRadius: 4,
    height: 'auto'
  },
  taskComplete : {
    color: "#7f8c8d",

  },
  taskText: {
    fontSize: 16,
    fontFamily: "Helvetica Neue",
    color: "#FFFFFF"
  }
});
