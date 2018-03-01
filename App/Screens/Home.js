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
  TouchableOpacity
} from 'react-native';

import prompt from 'react-native-prompt-android';
import Realm from 'realm';
import GridView from 'react-native-super-grid';

const TaskSchema = {
  name: 'Task',
  properties: {
    value:    'string',
    completed:'bool',
  }
};

const ListSchema = {
  name: 'List',
  properties: {
    listName: 'string',
    tasks:  {type: 'Task[]', default: []},
  }
};

export default class Home extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "TODO Lists"
    }
  }

  state = {
    realm: null,
    items: []
  }

  readFromRealm = async () => {
    var list = [];
    this.state.realm.objects('List').forEach(item => list.push(item));
    list.push(0);
    this.setState({items: list});
  }

  async componentWillMount() {
    var realm = await Realm.open({schema: [ListSchema, TaskSchema]});
    this.setState({realm: realm});
    this.readFromRealm();
  }

  writeToRealm = async (listName) => {
    let lists = this.state.realm.objects('List');
    if (lists.filtered('listName = "'+listName+'"').length !== 0) {
      this.addList();
      return;
    }
    this.state.realm.write(() => {
      this.state.realm.create('List', {
        listName: listName
      });
    });

    this.readFromRealm();
  }

  addList = () => {
    prompt(
      'Enter name', 'Enter the new list name',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (listName) => listName.length === 0 ? this.addList() : this.writeToRealm(listName),
        },
      ],
      {}
    );
  }

  goToList = (item) => {
    this.props.navigation.navigate('TodoScreen', {...item, realm: this.state.realm})
  }

  itemRenderer = (item) => {
    if (item !== 0) {
      return (
        <TouchableOpacity onPress={() => this.goToList(item)}>
          <View style={[styles.itemContainer]}>
            <Text style={styles.itemName}>{item.listName}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={this.addList}>
        <View style={[styles.newContainer]}>
          <Text style={styles.itemName}>New Item</Text>
        </View>
      </TouchableOpacity>
    );

  }

  render() {
    console.log(this.state.items)
    return (
      <View style={styles.container}>
        <GridView
          itemDimension={130}
          items={this.state.items}
          renderItem={this.itemRenderer}
          />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingBottom: 16
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 5,
    padding: 10,
    height: 150,
    backgroundColor: '#3498db'
  },
  newContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: 150,
    backgroundColor: '#9b59b6'
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
