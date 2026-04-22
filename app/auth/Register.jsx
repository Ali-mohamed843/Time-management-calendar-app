import { Calendar, Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { signUp } from '../../service/firebase';
import { router } from 'expo-router';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({}); 

    try {
      const result = await signUp(name, email, password);

      if (result.success) {
        setLoading(false);
        setTimeout(() => {
          router.replace('/tabs/Main');
        }, 100);
      } else {
        let errorMessage = 'An error occurred during sign up';

        if (result.error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered';
          setErrors({ email: errorMessage });
        } else if (result.error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
          setErrors({ email: errorMessage });
        } else if (result.error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak';
          setErrors({ password: errorMessage });
        } else if (result.error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your connection';
          setErrors({ email: errorMessage });
        } else {
          errorMessage = result.error.message || errorMessage;
          setErrors({ email: errorMessage });
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ email: 'An unexpected error occurred' });
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#8E9766]">
      <StatusBar barStyle="light-content" backgroundColor="#8E9766" />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-8"
          contentContainerStyle={{ paddingVertical: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-10 mt-20">
            <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-4">
              <Calendar size={48} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">Create Account</Text>
            <Text className="text-white/80 text-base mt-2">Sign up to get started</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-white text-sm font-medium mb-2">Full Name</Text>
              <View className={`flex-row items-center bg-white/10 rounded-full px-4 py-2 border ${errors.name ? 'border-red-700' : 'border-white/20'}`}>
                <User size={20} color="#FFFFFF" opacity={0.6} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                />
              </View>
              {errors.name && <Text className="text-red-700 text-md mt-1 ml-2">{errors.name}</Text>}
            </View>

            <View className="mt-4">
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
                  placeholder="Create a password (min 6 characters)"
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

            <View className="mt-4">
              <Text className="text-white text-sm font-medium mb-2">Confirm Password</Text>
              <View className={`flex-row items-center bg-white/10 rounded-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-700' : 'border-white/20'}`}>
                <Lock size={20} color="#FFFFFF" opacity={0.6} />
                <TextInput
                  className="flex-1 ml-3 text-white text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#FFFFFF" opacity={0.6} />
                  ) : (
                    <Eye size={20} color="#FFFFFF" opacity={0.6} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text className="text-red-700 text-md mt-1 ml-2">{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              className="bg-[#6B7556] rounded-full py-4 mt-6"
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-white/80 text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/Login')}>
                <Text className="text-white text-sm font-semibold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SignUpScreen;