import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { scheduleEventReminder, cancelEventReminder } from './notificationService';

export const signUp = async (name, email, password) => {
    try {
        console.log('Starting sign up process...');
        
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        console.log('User created:', userCredential.user.uid);
        
        const user = userCredential.user;

        console.log('Updating profile...');
        await user.updateProfile({
            displayName: name,
        });

        console.log('Saving to database...');
        await database().ref(`users/${user.uid}`).set({
            name: name,
            email: email,
            createdAt: Date.now(),
        });

        console.log('Sign up successful!');
        return { success: true, user };
    } catch (error) {
        console.error('Sign up error:', error.code, error.message);
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

export const getCurrentUser = () => {
    return auth().currentUser;
};

export const signOut = async () => {
    try {
        await auth().signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};


export const addEvent = async (date, eventData, reminderDate = null) => {
    try {
        const user = auth().currentUser;
        if (!user) throw new Error('No user logged in');

        const eventRef = database().ref(`users/${user.uid}/events/${date}`).push();
        
        const eventWithId = {
            ...eventData,
            id: eventRef.key,
            createdAt: Date.now(),
        };

        await eventRef.set(eventWithId);

        if (reminderDate && reminderDate > new Date()) {
            const notificationResult = await scheduleEventReminder(eventWithId, reminderDate);
            
            if (notificationResult.success) {
                await eventRef.update({
                    notificationScheduled: true,
                    reminderTimestamp: reminderDate.getTime(),
                });
            }
        }

        return { success: true, eventId: eventRef.key };
    } catch (error) {
        console.error('Add event error:', error);
        return { success: false, error };
    }
};

export const getEventsByDate = async (date) => {
    try {
        const user = auth().currentUser;
        if (!user) throw new Error('No user logged in');

        const snapshot = await database()
            .ref(`users/${user.uid}/events/${date}`)
            .once('value');

        const events = [];
        snapshot.forEach((childSnapshot) => {
            events.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
            });
        });

        return { success: true, events };
    } catch (error) {
        console.error('Get events error:', error);
        return { success: false, error };
    }
};

export const getAllEvents = async () => {
    try {
        const user = auth().currentUser;
        if (!user) throw new Error('No user logged in');

        const snapshot = await database()
            .ref(`users/${user.uid}/events`)
            .once('value');

        const eventsByDate = {};
        snapshot.forEach((dateSnapshot) => {
            const date = dateSnapshot.key;
            const events = [];
            dateSnapshot.forEach((eventSnapshot) => {
                events.push({
                    id: eventSnapshot.key,
                    ...eventSnapshot.val(),
                });
            });
            eventsByDate[date] = events;
        });

        return { success: true, eventsByDate };
    } catch (error) {
        console.error('Get all events error:', error);
        return { success: false, error };
    }
};

export const updateEvent = async (date, eventId, updates, newReminderDate = null) => {
    try {
        const user = auth().currentUser;
        if (!user) throw new Error('No user logged in');

        await database()
            .ref(`users/${user.uid}/events/${date}/${eventId}`)
            .update(updates);

        if (newReminderDate && newReminderDate > new Date()) {
            const eventSnapshot = await database()
                .ref(`users/${user.uid}/events/${date}/${eventId}`)
                .once('value');
            
            const eventData = eventSnapshot.val();
            
            const notificationResult = await scheduleEventReminder(eventData, newReminderDate);
            
            if (notificationResult.success) {
                await database()
                    .ref(`users/${user.uid}/events/${date}/${eventId}`)
                    .update({
                        notificationScheduled: true,
                        reminderTimestamp: newReminderDate.getTime(),
                    });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Update event error:', error);
        return { success: false, error };
    }
};

export const deleteEvent = async (date, eventId) => {
    try {
        const user = auth().currentUser;
        if (!user) throw new Error('No user logged in');

        const eventSnapshot = await database()
            .ref(`users/${user.uid}/events/${date}/${eventId}`)
            .once('value');
        
        const eventData = eventSnapshot.val();
        
        if (eventData?.notificationScheduled) {
            await cancelEventReminder(eventId);
        }

        await database()
            .ref(`users/${user.uid}/events/${date}/${eventId}`)
            .remove();

        return { success: true };
    } catch (error) {
        console.error('Delete event error:', error);
        return { success: false, error };
    }
};

export const listenToDateEvents = (date, callback) => {
    const user = auth().currentUser;
    if (!user) return null;

    const eventsRef = database().ref(`users/${user.uid}/events/${date}`);
    
    const listener = eventsRef.on('value', (snapshot) => {
        const events = [];
        snapshot.forEach((childSnapshot) => {
            events.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
            });
        });
        callback(events);
    });

    return () => eventsRef.off('value', listener);
};

export { auth, database };