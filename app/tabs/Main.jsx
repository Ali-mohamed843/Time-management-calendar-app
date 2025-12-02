import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Menu, Plus, Check } from 'lucide-react-native';

const CalendarApp = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Dates with tasks/plans
  const datesWithTasks = ['2025-12-01', '2025-12-06', '2025-12-13', '2025-12-20', '2025-12-25'];

  const tasks = [
    {
      id: 1,
      title: 'Daily UI Challenge',
      time: '10.00am - 10.30am',
      status: 'done',
      color: '#fb923c'
    },
    {
      id: 2,
      title: 'Learn Ui/Ux Tips',
      time: '1.30pm - 3.00pm',
      status: 'progress',
      color: '#9333ea'
    },
    {
      id: 3,
      title: 'Upload Todays Post In Instagram',
      time: '6.00pm - 6.30pm',
      status: 'pending',
      color: '#d1d5db'
    }
  ];

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowNotes(true);
  };

  const handleCloseNotes = () => {
    setShowNotes(false);
  };

  const markedDates = {
    ...datesWithTasks.reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: '#FFFFFF',
      };
      return acc;
    }, {}),
    [selectedDate]: {
      selected: true,
      selectedColor: '#6B7556',
      marked: datesWithTasks.includes(selectedDate),
      dotColor: '#FFFFFF',
    },
  };

  return (
    <View className="flex-1 bg-[#8E9766]">
      <StatusBar barStyle="light-content" backgroundColor="#8E9766" />
      
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Calendar Section */}
          <View className="px-6 pt-6">
            {/* Header */}
            <View className="flex-row mt-10 justify-between items-center mb-8">
              <TouchableOpacity>
                <Menu size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <View className="w-12 h-12 rounded-full bg-white overflow-hidden">
                <View className="w-full h-full bg-gray-300" />
              </View>
            </View>

            {/* Calendar */}
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
                    textAlign: 'right',
                  },
                  header: {
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
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

          {/* Bottom Sheet - Today's Tasks - Takes remaining space */}
          <View className="flex-1 bg-[#FFF5E9] rounded-t-3xl pt-4 px-6">
            {/* Handle bar */}
            <View className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
           
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-2xl font-semibold text-gray-800 mb-6">
                Today
              </Text>

              {/* Task List */}
              {tasks.map((task) => (
                <View key={task.id} className="flex-row items-center mb-4">
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      task.status === 'done'
                        ? 'border-transparent'
                        : 'border-gray-300 bg-white'
                    }`}
                    style={task.status === 'done' ? { backgroundColor: task.color } : {}}
                  >
                    {task.status === 'done' && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                  </View>

                  <View className="flex-1 ml-4">
                    <Text className="text-gray-800 font-medium text-base">{task.title}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{task.time}</Text>
                  </View>

                  {task.status !== 'pending' && (
                    <View
                      className="px-4 py-1.5 rounded-full"
                      style={{ backgroundColor: task.color }}
                    >
                      <Text className="text-white text-sm font-medium">
                        {task.status === 'done' ? 'Done' : 'In Progress'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Floating Add Button */}
            <TouchableOpacity
              className="absolute bottom-8 right-8 w-14 h-14 bg-[#6B7556] rounded-2xl items-center justify-center"
              activeOpacity={0.8}
            >
              <Plus size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Full Notes Modal */}
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
              {/* Handle bar */}
              <Pressable onPress={handleCloseNotes}>
                <View className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
              </Pressable>

              <Text className="text-2xl font-semibold text-gray-800 mb-6">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Select a date'}
              </Text>

              {/* Task List */}
              {tasks.map((task) => (
                <View
                  key={task.id}
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
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      task.status === 'done'
                        ? 'border-transparent'
                        : 'border-gray-300 bg-white'
                    }`}
                    style={task.status === 'done' ? { backgroundColor: task.color } : {}}
                  >
                    {task.status === 'done' && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                  </View>

                  <View className="flex-1 ml-4">
                    <Text className="text-gray-800 font-medium text-base">{task.title}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{task.time}</Text>
                  </View>

                  {task.status !== 'pending' && (
                    <View
                      className="px-4 py-1.5 rounded-full"
                      style={{ backgroundColor: task.color }}
                    >
                      <Text className="text-white text-sm font-medium">
                        {task.status === 'done' ? 'Done' : 'In Progress'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Add Button in Modal */}
            <TouchableOpacity
              className="absolute bottom-8 right-8 w-14 h-14 bg-[#6B7556] rounded-2xl items-center justify-center"
              activeOpacity={0.8}
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