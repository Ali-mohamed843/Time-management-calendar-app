import 'expo-router/entry';
import messaging from '@react-native-firebase/messaging';

// Register background handler for FCM
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // You can process the notification here if needed
});