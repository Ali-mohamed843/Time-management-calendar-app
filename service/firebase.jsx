// services/firebase.jsx
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

// Authentication Functions
export const signUp = async (name, email, password) => {
    try {
        // Create user with email and password
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user profile with name
        await user.updateProfile({
            displayName: name,
        });

        // Save user data to Realtime Database
        await database().ref(`users/${user.uid}`).set({
            name: name,
            email: email,
            createdAt: Date.now(),
        });

        return { success: true, user };
    } catch (error) {
        return { success: false, error };
    }
};

export const signIn = async (email, password) => {
    try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error };
    }
};

export const resetPassword = async (email) => {
    try {
        await auth().sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

// Get current user
export const getCurrentUser = () => {
    return auth().currentUser;
};

// Sign out
export const signOut = async () => {
    try {
        await auth().signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

export { auth, database };
