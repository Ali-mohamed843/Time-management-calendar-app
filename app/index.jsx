import { router } from 'expo-router';
import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';

export default function OnboardingScreen() {
  const handleGetStarted = () => {
    router.push('/auth/Login');
  };

  return (
    <SafeAreaView className="flex-1 ">
      <StatusBar barStyle="dark-content" backgroundColor="#E8D5C4" />
      
      <View className="flex-1 items-center justify-between px-6 pt-8 pb-10">
        <View className="flex-1 items-center justify-center w-full">
          <Image
            source={require('../assets/images/bg.png')}
            className="w-full h-76"
            resizeMode="contain"
          />
        </View>
        <View className="w-full">
          <Text 
            className="text-4xl text-black mb-3 leading-tight"
            style={{ fontFamily: 'Laila-Bold' }}
          >
            Planner, Reminder,{'\n'}Calendar
          </Text>

          <Text 
            className="text-base text-gray-700 mb-8 px-2 leading-relaxed"
            style={{ fontFamily: 'Laila-Regular' }}
          >
            It is more convenient for you to monitor and manage your project timelines.
          </Text>

          <TouchableOpacity
            onPress={handleGetStarted}
            className="w-full bg-[#8E9766] py-5 rounded-full shadow-lg"
            activeOpacity={0.7}
          >
            <Text 
              className="text-white text-lg text-center font-semibold"
              style={{ fontFamily: 'Laila-SemiBold' }}
            >
              Let's Go
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
