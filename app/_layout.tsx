import { Stack } from "expo-router";
import "../global.css";
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { initializeFCM } from '../service/notificationService';

export default function RootLayout() {

  useEffect(() => {
    const unsubscribe = initializeFCM();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App has come to the foreground');
      }
    });

    return () => {
      unsubscribe && unsubscribe();
      subscription.remove();
    };
  }, []);

  return <Stack>
    <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
    <Stack.Screen
          name="auth"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="tabs"
          options={{ headerShown: false }}
        />    
  </Stack>;
}
