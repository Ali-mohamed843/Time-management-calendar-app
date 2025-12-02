// LoginScreen.js
import { Calendar, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { resetPassword, signIn } from '../../service/firebase';
import { router } from 'expo-router';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      Alert.alert('Success', 'Login successful!', [
        {
          text: 'OK',
          onPress: () => router.push('/tabs/home'), // Replace with your main screen name
        },
      ]);
    } else {
      let errorMessage = 'An error occurred during login';

      if (result.error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (result.error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (result.error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (result.error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (result.error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (result.error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }

      Alert.alert('Login Failed', errorMessage);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const result = await resetPassword(email);

    if (result.success) {
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email address'
      );
    } else {
      let errorMessage = 'Failed to send password reset email';

      if (result.error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View className="flex-1 bg-[#8E9766]">
      <StatusBar barStyle="light-content" backgroundColor="#8E9766" />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 justify-center">
          {/* Logo/Icon */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-4">
              <Calendar size={48} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">Welcome Back</Text>
            <Text className="text-white/80 text-base mt-2">Sign in to continue</Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            {/* Email Input */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">Email</Text>
              <View className={`flex-row items-center bg-white/10 rounded-2xl px-4 py-4 border ${errors.email ? 'border-red-400' : 'border-white/20'}`}>
                <Mail size={20} color="#FFFFFF" opacity={0.6} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text className="text-red-300 text-xs mt-1 ml-2">{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View className="mt-4">
              <Text className="text-white text-sm font-medium mb-2">Password</Text>
              <View className={`flex-row items-center bg-white/10 rounded-2xl px-4 py-4 border ${errors.password ? 'border-red-400' : 'border-white/20'}`}>
                <Lock size={20} color="#FFFFFF" opacity={0.6} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#FFFFFF" opacity={0.6} />
                  ) : (
                    <Eye size={20} color="#FFFFFF" opacity={0.6} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-red-300 text-xs mt-1 ml-2">{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mt-2" onPress={handleForgotPassword}>
              <Text className="text-white text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-[#6B7556] rounded-2xl py-4 mt-6"
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-white/80 text-sm">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text className="text-white text-sm font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Decorative Element */}
          <View className="absolute bottom-0 left-0 right-0 items-center pb-8">
            <View className="flex-row space-x-2">
              <View className="w-2 h-2 bg-white/30 rounded-full" />
              <View className="w-2 h-2 bg-white rounded-full" />
              <View className="w-2 h-2 bg-white/30 rounded-full" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;