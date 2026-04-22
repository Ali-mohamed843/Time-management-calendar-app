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

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

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
    setErrors({}); 

    const result = await signIn(email, password);

    if (result.success) {
      router.push('/tabs/Main');
    } else {
      let errorMessage = 'An error occurred during login';

      if (result.error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
        setErrors({ email: errorMessage });
      } else if (result.error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
        setErrors({ password: errorMessage });
      } else if (result.error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
        setErrors({ email: errorMessage });
      } else if (result.error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
        setErrors({ email: errorMessage });
      } else if (result.error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
        setErrors({ password: errorMessage });
      } else if (result.error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
        setErrors({ email: errorMessage, password: 'Invalid email or password' });
      } else {
        setErrors({ password: errorMessage });
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
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

      setErrors({ email: errorMessage });
    }
  };

  return (
    <View className="flex-1 bg-[#8E9766]">
      <StatusBar barStyle="light-content" backgroundColor="#8E9766" />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 justify-center">
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-4">
              <Calendar size={48} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">Welcome Back</Text>
            <Text className="text-white/80 text-base mt-2">Sign in to continue</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-white text-sm font-medium mb-2">Email</Text>
              <View className={`flex-row items-center bg-white/10 rounded-full px-4 py-2 border ${errors.email ? 'border-red-700' : 'border-white/20'}`}>
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
              {errors.email && <Text className="text-red-700 text-md mt-1 ml-2">{errors.email}</Text>}
            </View>

            <View className="mt-4">
              <Text className="text-white text-sm font-medium mb-2">Password</Text>
              <View className={`flex-row items-center bg-white/10 rounded-full px-4 py-2 border ${errors.password ? 'border-red-700' : 'border-white/20'}`}>
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
              {errors.password && <Text className="text-red-700 text-md mt-1 ml-2">{errors.password}</Text>}
            </View>

            {/* <TouchableOpacity className="self-end mt-2" onPress={handleForgotPassword}>
              <Text className="text-white text-sm">Forgot Password?</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              className="bg-[#6B7556] rounded-full py-4 mt-6"
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

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-white/80 text-sm">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/Register')}>
                <Text className="text-white text-sm font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;