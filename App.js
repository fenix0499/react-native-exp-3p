import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';

import RNSketchCanvas from '@terrylinla/react-native-sketch-canvas';
import {captureScreen} from 'react-native-view-shot';
//import firebase from './firebase';
import CameraRoll from '@react-native-community/cameraroll';

export default function App() {
  const onSelectImagePress = () => launchImageLibrary({mediaType: 'image'}, imageCallback);
  async function hasAndroidPermission(uri) {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  async function savePicture(uri) {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }

    CameraRoll.save(uri);
  }

  const imageCallback = (media) => {
    if (!media.didCancel) {
      const reference = storage().ref(media.fileName);
      const task = reference.putFile(media.uri);
    }
  }

  const onMediaSelect = async uri => {
    savePicture(uri);

    try {
      const reference = storage().ref(uri);
      // path to existing file on filesystem
      const pathToFile = uri;
      await reference.putFile(pathToFile);
      Alert.alert('Image uploaded!');
    } catch (e) {
      console.log(`error: ${e}`);
    }

    onSelectImagePress();
    // uploads file

    /*if (uri) {
      const reference = firebase.storage().ref('img');
      const task = reference.putFile(uri);
      task
        .then(() => {
          // 4
          console.log('Image uploaded to the bucket!');
        })
        .catch(e => console.log('uploading image error => ', e));
    }*/
  };
  return (
    <View style={styles.container}>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <RNSketchCanvas
          containerStyle={{backgroundColor: 'transparent', flex: 1}}
          canvasStyle={{backgroundColor: 'transparent', flex: 1}}
          defaultStrokeIndex={0}
          defaultStrokeWidth={5}
          closeComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Close</Text>
            </View>
          }
          undoComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Undo</Text>
            </View>
          }
          clearComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Clear</Text>
            </View>
          }
          eraseComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Eraser</Text>
            </View>
          }
          strokeComponent={color => (
            <View
              style={[{backgroundColor: color}, styles.strokeColorButton]}
            />
          )}
          strokeSelectedComponent={(color, index, changed) => {
            return (
              <View
                style={[
                  {backgroundColor: color, borderWidth: 2},
                  styles.strokeColorButton,
                ]}
              />
            );
          }}
          strokeWidthComponent={w => {
            return (
              <View style={styles.strokeWidthButton}>
                <View
                  style={{
                    backgroundColor: 'white',
                    marginHorizontal: 2.5,
                    width: Math.sqrt(w / 3) * 10,
                    height: Math.sqrt(w / 3) * 10,
                    borderRadius: (Math.sqrt(w / 3) * 10) / 2,
                  }}
                />
              </View>
            );
          }}
          saveComponent={
            <View style={styles.functionButton}>
              <Text style={{color: 'white'}}>Save</Text>
            </View>
          }
          savePreference={() => {
            captureScreen({
              format: 'jpg',
              quality: 0.9,
            }).then(
              uri => onMediaSelect(uri), //console.log('Image temporarily saved to', uri),
              error => console.error('Oops, snapshot failed', error),
            );
            return {
              folder: 'RNSketchCanvas',
              filename: String(Math.ceil(Math.random() * 100000000)),
              transparent: false,
              imageType: 'png',
            };
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#39579A',
  },
  functionButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    height: 30,
    width: 60,
    backgroundColor: '#39579A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
});

AppRegistry.registerComponent('App', () => App);
