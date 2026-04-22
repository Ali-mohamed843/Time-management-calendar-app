import { router } from 'expo-router';
import { Check, Menu, Plus, X, LogOut, User, Calendar as CalendarIcon, Bell, Moon, Info, Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getAllEvents, listenToDateEvents, updateEvent, signOut, getCurrentUser } from '../../service/firebase';

const CalendarApp = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [todayEvents, setTodayEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [datesWithEvents, setDatesWithEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarAnim] = useState(new Animated.Value(-300));
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [totalEvents, setTotalEvents] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.displayName || 'User');
      setUserEmail(user.email || '');
    }
  }, []);

  useEffect(() => {
    loadAllEvents();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToDateEvents(today, (events) => {
      const updatedEvents = updateEventStatuses(events, today);
      setTodayEvents(updatedEvents);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [today]);

  useEffect(() => {
    if (selectedDate) {
      const unsubscribe = listenToDateEvents(selectedDate, (events) => {
        const updatedEvents = updateEventStatuses(events, selectedDate);
        setSelectedDateEvents(updatedEvents);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (todayEvents.length > 0) {
        const updatedEvents = updateEventStatuses(todayEvents, today);
        setTodayEvents(updatedEvents);
      }
      if (selectedDateEvents.length > 0 && selectedDate === today) {
        const updatedEvents = updateEventStatuses(selectedDateEvents, selectedDate);
        setSelectedDateEvents(updatedEvents);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [todayEvents, selectedDateEvents, today, selectedDate]);

  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: sidebarVisible ? 0 : -300,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);

  const loadAllEvents = async () => {
    setLoading(true);
    const result = await getAllEvents();
    if (result.success) {
      const dates = Object.keys(result.eventsByDate).filter(
        date => result.eventsByDate[date].length > 0
      );
      setDatesWithEvents(dates);
      
      let count = 0;
      Object.values(result.eventsByDate).forEach(events => {
        count += events.length;
      });
      setTotalEvents(count);
    }
    setLoading(false);
  };

  const updateEventStatuses = (events, date) => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    return events.map(event => {
      if (date !== currentDate) {
        return event;
      }

      const [startHour, startMinute] = parseTime(event.startTime);
      const [endHour, endMinute] = parseTime(event.endTime);

      const eventStartTime = new Date(now);
      eventStartTime.setHours(startHour, startMinute, 0, 0);

      const eventEndTime = new Date(now);
      eventEndTime.setHours(endHour, endMinute, 0, 0);

      let newStatus = event.status || 'pending';

      if (now < eventStartTime) {
        newStatus = 'pending';
      } else if (now >= eventStartTime && now <= eventEndTime) {
        newStatus = 'progress';
      } else if (now > eventEndTime) {
        newStatus = 'done';
      }

      if (newStatus !== event.status) {
        updateEvent(date, event.id, { status: newStatus });
      }

      return { ...event, status: newStatus };
    });
  };

  const parseTime = (timeString) => {
    const match = timeString.match(/(\d+)\.(\d+)(am|pm)/);
    if (!match) return [0, 0];

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3];

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return [hours, minutes];
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowNotes(true);
  };

  const handleCloseNotes = () => {
    setShowNotes(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      router.replace('/auth/Login');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return '#fb923c';
      case 'progress':
        return '#9333ea';
      default:
        return '#d1d5db';
    }
  };

  const markedDates = {
    ...datesWithEvents.reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: '#FFFFFF',
      };
      return acc;
    }, {}),
    [selectedDate]: {
      selected: true,
      selectedColor: '#6B7556',
      marked: datesWithEvents.includes(selectedDate),
      dotColor: '#FFFFFF',
    },
  };

  const renderEventItem = (event) => {
    const color = getStatusColor(event.status);

    const getBorderColor = () => {
      if (event.status === 'done') return 'transparent';
      if (event.status === 'progress') return '#9333ea';
      return '#d1d5db';
    };

    return (
      <View key={event.id} className="flex-row items-center mb-4">
        <View className="items-center">
          <View
            className="w-7 h-7 rounded-full border-4 items-center justify-center bg-white"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: event.status === 'done' ? color : '#FFFFFF',
            }}
          >
            {event.status === 'done' && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
          </View>

          <View
            className="w-0.5 h-8 mt-1"
            style={{
              borderLeftWidth: 2,
              borderLeftColor: '#d1d5db',
              borderStyle: 'dotted',
            }}
          />
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-gray-800 font-medium text-base">{event.title}</Text>
          <Text className="text-gray-500 text-sm mt-1">
            {event.startTime} - {event.endTime}
          </Text>
          {event.location && (
            <Text className="text-gray-400 text-xs mt-0.5">📍 {event.location}</Text>
          )}
        </View>

        {event.status !== 'pending' && (
          <View
            className="px-4 py-1.5 rounded-full"
            style={{ backgroundColor: color }}
          >
            <Text className="text-white text-sm font-medium">
              {event.status === 'done' ? 'Done' : 'In Progress'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#8E9766]">
      <StatusBar barStyle="light-content" backgroundColor="#8E9766" />

      <SafeAreaView className="flex-1">
        <View className="flex-1">
          <View className="px-6 pt-6">
            <View className="flex-row mt-10 justify-between items-center mb-8">
              <TouchableOpacity onPress={toggleSidebar}>
                <Menu size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <View className="w-12 h-12 rounded-full bg-white overflow-hidden">
                <View className="w-full h-full bg-gray-300 items-center justify-center">
                  <Text className="text-gray-600 font-semibold text-lg">
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View>
              <Calendar
                current={today}
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                hideArrows={true}
                theme={{
                  calendarBackground: 'transparent',
                  textSectionTitleColor: '#FFFFFF',
                  textSectionTitleDisabledColor: '#d9e1e8',
                  selectedDayBackgroundColor: '#6B7556',
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: '#FFFFFF',
                  dayTextColor: '#FFFFFF',
                  textDisabledColor: '#8E9766',
                  monthTextColor: '#FFFFFF',
                  indicatorColor: '#FFFFFF',
                  textDayFontSize: 16,
                  textMonthFontSize: 24,
                  textDayHeaderFontSize: 12,
                  textDayFontWeight: '400',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '400',
                  'stylesheet.calendar.header': {
                    monthText: {
                      fontSize: 28,
                      fontWeight: '600',
                      color: '#FFFFFF',
                      marginBottom: 20,
                      textAlign: 'center',
                    },
                    header: {
                      flexDirection: 'row',
                      justifyContent: 'center',
                      paddingLeft: 0,
                      paddingRight: 0,
                      marginBottom: 30,
                      alignItems: 'center',
                    },
                    week: {
                      marginTop: 7,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    },
                  },
                  'stylesheet.day.basic': {
                    base: {
                      width: 44,
                      height: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    selected: {
                      backgroundColor: '#6B7556',
                      borderRadius: 20,
                    },
                    today: {
                      backgroundColor: '#6B7556',
                      borderRadius: 20,
                    },
                    text: {
                      fontSize: 18,
                      fontWeight: '400',
                      color: '#FFFFFF',
                    },
                  },
                }}
                hideExtraDays={true}
                disableMonthChange={false}
                firstDay={0}
                hideDayNames={false}
                showWeekNumbers={false}
                enableSwipeMonths={true}
                style={{
                  marginBottom: 40,
                  paddingBottom: 20,
                }}
              />
            </View>
          </View>

          <View className="flex-1 bg-[#FFF5E9] rounded-t-3xl pt-4">
            <View className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
              <Text className="text-2xl font-semibold text-gray-800 mb-6">
                Today
              </Text>

              {loading ? (
                <View className="items-center justify-center py-10">
                  <ActivityIndicator size="large" color="#8E9766" />
                </View>
              ) : todayEvents.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-400 text-base">No events for today</Text>
                  <Text className="text-gray-400 text-sm mt-2">Tap + to add an event</Text>
                </View>
              ) : (
                todayEvents.map(renderEventItem)
              )}
            </ScrollView>

            <View className="px-6 pb-8 pt-4">
              <TouchableOpacity
                className="self-end w-16 h-14 bg-[#6B7556] rounded-2xl items-center justify-center"
                activeOpacity={0.8}
                onPress={() => router.push('/tabs/Add')}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Plus size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={sidebarVisible}
        transparent={true}
        animationType="none"
        onRequestClose={toggleSidebar}
      >
        <Pressable 
          className="flex-1 bg-black/50" 
          onPress={toggleSidebar}
        >
          <Animated.View
            style={{
              transform: [{ translateX: sidebarAnim }],
            }}
            className="absolute left-0 top-0 bottom-0 w-80"
          >
            <Pressable 
              onPress={(e) => e.stopPropagation()}
              className="flex-1 bg-white"
            >
              <SafeAreaView className="flex-1">
                <View className="px-6 pt-6 pb-6 bg-[#8E9766]">
                  <TouchableOpacity 
                    onPress={toggleSidebar}
                    className="self-end mb-4"
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <View className="bg-white/10 rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                      <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
                        <Text className="text-[#8E9766] font-bold text-2xl">
                          {userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="text-white font-bold text-lg" numberOfLines={1}>
                          {userName}
                        </Text>
                        <Text className="text-white/80 text-sm" numberOfLines={1}>
                          {userEmail}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-around pt-3 border-t border-white/20">
                      <View className="items-center">
                        <Text className="text-white font-bold text-xl">{totalEvents}</Text>
                        <Text className="text-white/70 text-xs">Events</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-white font-bold text-xl">{todayEvents.length}</Text>
                        <Text className="text-white/70 text-xs">Today</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-white font-bold text-xl">{datesWithEvents.length}</Text>
                        <Text className="text-white/70 text-xs">Days</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <ScrollView className="flex-1 px-6 py-4">
                  <Text className="text-gray-400 text-xs font-semibold uppercase mb-3">
                    Account
                  </Text>
                  
                  <TouchableOpacity 
                    className="flex-row items-center py-4 mb-2"
                    onPress={() => {
                      toggleSidebar();
                      
                    }}
                  >
                    <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center">
                      <User size={22} color="#3b82f6" strokeWidth={2} />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-gray-800 text-base font-semibold">My Profile</Text>
                      <Text className="text-gray-400 text-xs">View and edit profile</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex-row items-center py-4 mb-2"
                    onPress={() => {
                      toggleSidebar();
                    }}
                  >
                    <View className="w-11 h-11 rounded-xl bg-purple-50 items-center justify-center">
                      <CalendarIcon size={22} color="#9333ea" strokeWidth={2} />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-gray-800 text-base font-semibold">All Events</Text>
                      <Text className="text-gray-400 text-xs">Browse all your events</Text>
                    </View>
                  </TouchableOpacity>

                  <View className="h-px bg-gray-100 my-3" />
                  
                  <Text className="text-gray-400 text-xs font-semibold uppercase mb-3 mt-2">
                    Preferences
                  </Text>

                  <TouchableOpacity 
                    className="flex-row items-center py-4 mb-2"
                    onPress={() => {
                      toggleSidebar();
                    }}
                  >
                    <View className="w-11 h-11 rounded-xl bg-orange-50 items-center justify-center">
                      <Bell size={22} color="#f97316" strokeWidth={2} />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-gray-800 text-base font-semibold">Notifications</Text>
                      <Text className="text-gray-400 text-xs">Manage reminders</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex-row items-center py-4 mb-2"
                    onPress={() => {
                      toggleSidebar();
                    }}
                  >
                    <View className="w-11 h-11 rounded-xl bg-indigo-50 items-center justify-center">
                      <Moon size={22} color="#6366f1" strokeWidth={2} />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-gray-800 text-base font-semibold">Appearance</Text>
                      <Text className="text-gray-400 text-xs">Theme & display</Text>
                    </View>
                  </TouchableOpacity>

                  <View className="h-px bg-gray-100 my-3" />
                  
                  <Text className="text-gray-400 text-xs font-semibold uppercase mb-3 mt-2">
                    Support
                  </Text>

                  <TouchableOpacity 
                    className="flex-row items-center py-4 mb-2"
                    onPress={() => {
                      toggleSidebar();
                    }}
                  >
                    <View className="w-11 h-11 rounded-xl bg-green-50 items-center justify-center">
                      <Info size={22} color="#22c55e" strokeWidth={2} />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-gray-800 text-base font-semibold">Help & About</Text>
                      <Text className="text-gray-400 text-xs">Get support</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex-row items-center py-4 mb-2"
                    onPress={() => {
                      toggleSidebar();
                    }}
                  >
                    <View className="w-11 h-11 rounded-xl bg-pink-50 items-center justify-center">
                      <Mail size={22} color="#ec4899" strokeWidth={2} />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-gray-800 text-base font-semibold">Contact Us</Text>
                      <Text className="text-gray-400 text-xs">Send feedback</Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>

                <View className="px-6 pb-6 pt-4 border-t border-gray-100">
                  <TouchableOpacity 
                    className="flex-row items-center justify-center py-4 bg-red-50 rounded-xl"
                    onPress={handleSignOut}
                    activeOpacity={0.7}
                  >
                    <LogOut size={22} color="#dc2626" strokeWidth={2} />
                    <Text className="ml-3 text-red-600 text-base font-bold">Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        visible={showNotes}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseNotes}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={handleCloseNotes}
        >
          <Pressable
            className="bg-[#FFF5E9] rounded-t-3xl"
            style={{ maxHeight: '80%' }}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView className="px-6 pt-6 pb-24" showsVerticalScrollIndicator={false}>
              <Pressable onPress={handleCloseNotes}>
                <View className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
              </Pressable>

              <Text className="text-2xl font-semibold text-gray-800 mb-6">
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Select a date'}
              </Text>

              {selectedDateEvents.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-400 text-base">No events for this date</Text>
                  <Text className="text-gray-400 text-sm mt-2">Tap + to add an event</Text>
                </View>
              ) : (
                selectedDateEvents.map((event) => {
                  const getBorderColor = () => {
                    if (event.status === 'done') return 'transparent';
                    if (event.status === 'progress') return '#9333ea';
                    return '#d1d5db';
                  };

                  return (
                    <View
                      key={event.id}
                      className="flex-row items-center bg-white p-4 rounded-2xl mb-4"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View
                        className="w-7 h-7 rounded-full border-4 items-center justify-center bg-white"
                        style={{
                          borderColor: getBorderColor(),
                          backgroundColor: event.status === 'done' ? getStatusColor(event.status) : '#FFFFFF',
                        }}
                      >
                        {event.status === 'done' && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                      </View>

                      <View className="flex-1 ml-4">
                        <Text className="text-gray-800 font-medium text-base">{event.title}</Text>
                        <Text className="text-gray-500 text-sm mt-1">
                          {event.startTime} - {event.endTime}
                        </Text>
                        {event.location && (
                          <Text className="text-gray-400 text-xs mt-1">📍 {event.location}</Text>
                        )}
                      </View>

                      {event.status !== 'pending' && (
                        <View
                          className="px-4 py-1.5 rounded-full"
                          style={{ backgroundColor: getStatusColor(event.status) }}
                        >
                          <Text className="text-white text-sm font-medium">
                            {event.status === 'done' ? 'Done' : 'In Progress'}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              className="absolute bottom-8 right-8 w-14 h-14 bg-[#6B7556] rounded-2xl items-center justify-center"
              activeOpacity={0.8}
              onPress={() => {
                handleCloseNotes();
                router.push(`/tabs/Add?date=${selectedDate}`);
              }}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Plus size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CalendarApp;