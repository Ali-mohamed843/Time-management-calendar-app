import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, TriggerType, AuthorizationStatus } from '@notifee/react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const requestNotificationPermission = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Expo notification permission denied');
      return { success: false, reason: 'permission_denied' };
    }

    console.log('✅ Expo notification permission granted');

    const settings = await notifee.requestPermission();
    
    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      console.log('Notifee permission denied, but continuing...');
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      await saveFCMToken(token);
      
      return { success: true, token };
    } else {
      console.log('FCM notification permission denied');
      return { success: false, reason: 'fcm_denied' };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, error };
  }
};

const saveFCMToken = async (token) => {
  try {
    const user = auth().currentUser;
    if (!user) return;

    await database().ref(`users/${user.uid}/fcmToken`).set(token);
    console.log('FCM token saved to database');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

export const createNotificationChannel = async () => {
  try {
    const channelId = await notifee.createChannel({
      id: 'event-reminders',
      name: 'Event Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
    });
    console.log('Notification channel created:', channelId);
    return channelId;
  } catch (error) {
    console.error('Error creating notification channel:', error);
  }
};

export const scheduleEventReminder = async (eventData, reminderDate) => {
  try {
    await createNotificationChannel();

    const triggerTimestamp = reminderDate.getTime();
    
    console.log('📅 Scheduling notification...');
    console.log('   Event:', eventData.title);
    console.log('   Scheduled for:', new Date(triggerTimestamp).toLocaleString());
    console.log('   Current time:', new Date().toLocaleString());
    console.log('   Time until notification:', Math.round((triggerTimestamp - Date.now()) / 1000 / 60), 'minutes');
    
    const notificationId = await notifee.createTriggerNotification(
      {
        id: eventData.id,
        title: '📅 Event Reminder',
        body: `${eventData.title} ${eventData.isAllDay ? 'today' : `at ${eventData.startTime}`}`,
        android: {
          channelId: 'event-reminders',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
          color: '#8E9766',
          vibrationPattern: [300, 500],
          sound: 'default',
          showTimestamp: true,
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        data: {
          eventId: eventData.id,
          date: eventData.date,
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTimestamp,
      }
    );

    console.log('✅ Event reminder scheduled successfully');
    console.log('   Notification ID:', notificationId);
    return { success: true, notificationId };
  } catch (error) {
    console.error('❌ Error scheduling reminder:', error);
    console.error('   Error details:', error.message);
    return { success: false, error };
  }
};

export const cancelEventReminder = async (notificationId) => {
  try {
    await notifee.cancelNotification(notificationId);
    console.log('✅ Notification cancelled:', notificationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error canceling reminder:', error);
    return { success: false, error };
  }
};

export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await notifee.getTriggerNotifications();
    console.log('📋 Scheduled notifications count:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ID: ${notif.notification.id}`);
      console.log(`      Time: ${new Date(notif.trigger.timestamp).toLocaleString()}`);
    });
    return { success: true, notifications };
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return { success: false, error };
  }
};

export const displayTestNotification = async () => {
  try {
    console.log('🔔 Displaying test notification...');
    await createNotificationChannel();
    
    await notifee.displayNotification({
      title: '✅ Test Notification',
      body: 'If you can see this, notifications are working perfectly!',
      android: {
        channelId: 'event-reminders',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher',
        color: '#8E9766',
        sound: 'default',
        vibrationPattern: [300, 500],
      },
    });
    
    console.log('✅ Test notification displayed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error displaying test notification:', error);
    console.error('   Error details:', error.message);
    return { success: false, error };
  }
};

export const setupForegroundNotificationHandler = () => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    console.log('📱 Foreground notification event:', type);
    
    if (type === 1) { 
      console.log('👆 User pressed notification:', detail.notification);
    }
  });
};


export const setupBackgroundNotificationHandler = () => {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('📱 Background notification event:', type);
    
    if (type === 1) { 
      console.log('👆 User pressed notification in background:', detail.notification);
    }
  });
};

export const initializeFCM = () => {
  console.log('🚀 Initializing FCM...');
  
  requestNotificationPermission();
  
  createNotificationChannel();

  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('📨 Foreground message received:', remoteMessage);
    
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Event Reminder',
      body: remoteMessage.notification?.body || 'You have an upcoming event',
      android: {
        channelId: 'event-reminders',
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher',
        color: '#8E9766',
      },
      ios: {
        sound: 'default',
      },
    });
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('📲 Notification opened app from background:', remoteMessage);
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('📲 App opened from quit state by notification:', remoteMessage);
      }
    });

  messaging().onTokenRefresh(token => {
    console.log('🔄 FCM token refreshed:', token);
    saveFCMToken(token);
  });

  setupForegroundNotificationHandler();
  setupBackgroundNotificationHandler();

  console.log('✅ FCM initialized successfully');

  return () => {
    unsubscribeForeground();
  };
};