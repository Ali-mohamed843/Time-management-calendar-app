import { router, useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addEvent } from '../../service/firebase';
import { requestNotificationPermission } from '../../service/notificationService';

const Calendar = memo(({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = `${currentMonth.toLocaleString('default', { month: 'long' })} ${currentMonth.getFullYear()}`;

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <View className="bg-white rounded-3xl p-5">
      <View className="flex-row justify-between items-center mb-5">
        <TouchableOpacity 
          onPress={prevMonth} 
          className="p-2"
          activeOpacity={1}
        >
          <Text className="text-2xl text-[#8E9766]">‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">{monthYear}</Text>
        <TouchableOpacity 
          onPress={nextMonth} 
          className="p-2"
          activeOpacity={1}
        >
          <Text className="text-2xl text-[#8E9766]">›</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-around mb-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <View key={i} className="w-10 items-center">
            <Text className="text-gray-500 font-semibold text-sm">{day}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day, index) => (
          <View key={index} className="w-[14.28%] aspect-square p-1">
            {day ? (
              <TouchableOpacity
                onPress={() => onDateSelect(day)}
                className={`flex-1 items-center justify-center rounded-full ${
                  isSelected(day) ? 'bg-[#8E9766]' : ''
                }`}
                activeOpacity={1}
              >
                <Text className={`text-base ${isSelected(day) ? 'text-white font-bold' : 'text-gray-800'}`}>
                  {day.getDate()}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-1" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
});

const TimePicker = memo(({ tempTime, onTimeChange }) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View className="bg-white rounded-3xl p-5 mt-4">
      <Text className="text-center text-lg font-semibold text-gray-800 mb-4">Select Time</Text>
      
      <View className="flex-row justify-center items-center">
        <ScrollView className="h-40 w-20" showsVerticalScrollIndicator={false}>
          {hours.map((h) => (
            <TouchableOpacity
              key={h}
              onPress={() => onTimeChange({ ...tempTime, hour: h })}
              className={`py-3 items-center ${tempTime.hour === h ? 'bg-[#8E9766]/20' : ''}`}
              activeOpacity={1}
            >
              <Text className={`text-lg ${tempTime.hour === h ? 'font-bold text-[#8E9766]' : 'text-gray-600'}`}>
                {h.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="text-2xl font-bold text-gray-800 mx-2">:</Text>

        <ScrollView className="h-40 w-20" showsVerticalScrollIndicator={false}>
          {minutes.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => onTimeChange({ ...tempTime, minute: m })}
              className={`py-3 items-center ${tempTime.minute === m ? 'bg-[#8E9766]/20' : ''}`}
              activeOpacity={1}
            >
              <Text className={`text-lg ${tempTime.minute === m ? 'font-bold text-[#8E9766]' : 'text-gray-600'}`}>
                {m.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="ml-4">
          <TouchableOpacity
            onPress={() => onTimeChange({ ...tempTime, period: 'am' })}
            className={`py-2 px-4 mb-2 rounded-full ${tempTime.period === 'am' ? 'bg-[#8E9766]' : 'bg-gray-200'}`}
            activeOpacity={1}
          >
            <Text className={`font-semibold ${tempTime.period === 'am' ? 'text-white' : 'text-gray-600'}`}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onTimeChange({ ...tempTime, period: 'pm' })}
            className={`py-2 px-4 rounded-full ${tempTime.period === 'pm' ? 'bg-[#8E9766]' : 'bg-gray-200'}`}
            activeOpacity={1}
          >
            <Text className={`font-semibold ${tempTime.period === 'pm' ? 'text-white' : 'text-gray-600'}`}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const DateTimePicker = memo(({ visible, onClose, onSave, title, tempDate, onDateSelect, isAllDay, tempTime, onTimeChange }) => (
  <Modal 
    visible={visible} 
    transparent 
    animationType="none"
    statusBarTranslucent
  >
    <View className="flex-1 bg-black/50 justify-center px-5">
      <View className="bg-[#EFE4D7] rounded-3xl p-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={1}>
            <Text className="text-2xl text-gray-500">✕</Text>
          </TouchableOpacity>
        </View>

        <Calendar selectedDate={tempDate} onDateSelect={onDateSelect} />
        {!isAllDay && <TimePicker tempTime={tempTime} onTimeChange={onTimeChange} />}

        <View className="flex-row mt-5 gap-3">
          <TouchableOpacity 
            onPress={onClose} 
            className="flex-1 bg-gray-300 rounded-full py-4"
            activeOpacity={1}
          >
            <Text className="text-center font-semibold text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onSave} 
            className="flex-1 bg-[#8E9766] rounded-full py-4"
            activeOpacity={1}
          >
            <Text className="text-center font-semibold text-white">Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
));

export default function EventScreen() {
  const params = useLocalSearchParams();
  const preselectedDate = params.date;

  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [enableReminder, setEnableReminder] = useState(true);
  
  const [fromDate, setFromDate] = useState(
    preselectedDate ? new Date(preselectedDate + 'T11:00:00') : new Date()
  );
  const [toDate, setToDate] = useState(
    preselectedDate ? new Date(preselectedDate + 'T17:30:00') : new Date()
  );
  const [reminderTime, setReminderTime] = useState(
    preselectedDate ? new Date(preselectedDate + 'T09:00:00') : new Date()
  );
  
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState({ hour: 11, minute: 0, period: 'am' });

  const isFormValid = eventName.trim().length > 0;

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]}`;
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}.${minutes.toString().padStart(2, '0')}${period}`;
  };

  const calculateTimeDifference = (eventDate, reminderDate) => {
    const diff = eventDate.getTime() - reminderDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Before ${hours} Hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `Before ${minutes} Minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'At event time';
    }
  };

  const openFromPicker = () => {
    setTempDate(new Date(fromDate));
    setTempTime({
      hour: fromDate.getHours() % 12 || 12,
      minute: fromDate.getMinutes(),
      period: fromDate.getHours() >= 12 ? 'pm' : 'am'
    });
    setShowFromPicker(true);
  };

  const openToPicker = () => {
    setTempDate(new Date(toDate));
    setTempTime({
      hour: toDate.getHours() % 12 || 12,
      minute: toDate.getMinutes(),
      period: toDate.getHours() >= 12 ? 'pm' : 'am'
    });
    setShowToPicker(true);
  };

  const openReminderPicker = () => {
    setTempDate(new Date(reminderTime));
    setTempTime({
      hour: reminderTime.getHours() % 12 || 12,
      minute: reminderTime.getMinutes(),
      period: reminderTime.getHours() >= 12 ? 'pm' : 'am'
    });
    setShowReminderPicker(true);
  };

  const saveFromDateTime = () => {
    const newDate = new Date(tempDate);
    let hours = tempTime.hour;
    if (tempTime.period === 'pm' && hours !== 12) hours += 12;
    if (tempTime.period === 'am' && hours === 12) hours = 0;
    newDate.setHours(hours, tempTime.minute);
    setFromDate(newDate);
    setShowFromPicker(false);
  };

  const saveToDateTime = () => {
    const newDate = new Date(tempDate);
    let hours = tempTime.hour;
    if (tempTime.period === 'pm' && hours !== 12) hours += 12;
    if (tempTime.period === 'am' && hours === 12) hours = 0;
    newDate.setHours(hours, tempTime.minute);
    setToDate(newDate);
    setShowToPicker(false);
  };

  const saveReminderTime = () => {
    const newDate = new Date(tempDate);
    let hours = tempTime.hour;
    if (tempTime.period === 'pm' && hours !== 12) hours += 12;
    if (tempTime.period === 'am' && hours === 12) hours = 0;
    newDate.setHours(hours, tempTime.minute);
    
    if (newDate >= fromDate) {
      setErrorMessage('Reminder time must be before the event start time');
      return;
    }
    
    setReminderTime(newDate);
    setShowReminderPicker(false);
  };

  const handleSaveEvent = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!eventName.trim()) {
      setErrorMessage('Please enter an event name');
      return;
    }

    if (enableReminder && reminderTime >= fromDate) {
      setErrorMessage('Reminder time must be before the event start time');
      return;
    }

    setSaving(true);

    try {
      const eventDate = fromDate.toISOString().split('T')[0];
      
      const eventData = {
        title: eventName.trim(),
        location: location.trim(),
        isAllDay,
        startTime: formatTime(fromDate),
        endTime: formatTime(toDate),
        reminderTime: formatTime(reminderTime),
        date: eventDate,
        status: 'pending',
        reminderEnabled: enableReminder,
      };

      const reminderDate = enableReminder && reminderTime > new Date() ? reminderTime : null;
      
      const result = await addEvent(eventDate, eventData, reminderDate);

      if (result.success) {
        router.replace('/tabs/Main');
      } else {
        setErrorMessage('Failed to save event. Please try again.');
      }
    } catch (error) {
      console.error('Save event error:', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDateSelect = useCallback((day) => {
    setTempDate(day);
  }, []);

  const handleTimeChange = useCallback((newTime) => {
    setTempTime(newTime);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#8E9766]">
      <View className="flex-row items-center mt-10 justify-between p-5 bg-[#8E9766]">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={1}>
          <Text className="text-white text-2xl">✕</Text>
        </TouchableOpacity>
        <View className="w-12 h-12 rounded-full bg-white/30" />
      </View>

      <Text className="text-white ml-5 text-3xl font-semibold">Event</Text>

      <View className="flex-1 bg-[#EFE4D7] mt-10 rounded-t-3xl">
        <ScrollView className="flex-1 px-5 pt-8">
          {errorMessage ? (
            <View className="mb-4 bg-red-100 border-l-4 border-red-500 px-4 py-3 rounded">
              <Text className="text-red-700 font-medium">{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View className="mb-4 bg-green-100 border-l-4 border-green-500 px-4 py-3 rounded">
              <Text className="text-green-700 font-medium">✓ {successMessage}</Text>
            </View>
          ) : null}

          <View className="mb-6 relative">
            <View className="absolute top-0 left-6 bg-[#EFE4D7] px-2 z-10">
              <Text className="text-gray-500 font-medium text-md">Event Name</Text>
            </View>
            <View className="border-2 border-[#8E9766] rounded-full px-6 py-2 bg-[#EFE4D7] mt-2">
              <TextInput
                value={eventName}
                onChangeText={setEventName}
                className="text-base text-black font-medium"
                placeholder="Enter event name"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View className="mb-6 relative">
            <View className="absolute top-0 left-6 bg-[#EFE4D7] px-2 z-10">
              <Text className="text-gray-500 font-medium text-md">Add Location</Text>
            </View>
            <View className="border-2 border-[#8E9766] rounded-full px-6 py-2 bg-[#EFE4D7] mt-2">
              <TextInput
                value={location}
                onChangeText={setLocation}
                className="text-base text-black font-medium"
                placeholder="Enter location"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-6 mt-3">
            <Text className="text-gray-500 font-medium text-xl">Date</Text>
            <View className="flex-row items-center">
              <Text className="text-black text-xl font-medium mr-3">All day event</Text>
              <View className="rounded-full p-0.5">
                <Switch
                  value={isAllDay}
                  onValueChange={setIsAllDay}
                  trackColor={{ false: '#E5E7EB', true: '#8E9766' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor="#E5E7EB"
                />
              </View>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-500 text-md font-medium mb-2">From</Text>
            <TouchableOpacity 
              onPress={openFromPicker} 
              className="flex-row items-center justify-between"
              activeOpacity={1}
            >
              <Text className="text-black text-xl font-medium">{formatDate(fromDate)}</Text>
              {!isAllDay && (
                <View className="flex-row items-center">
                  <Text className="text-black text-xl font-medium mr-2">{formatTime(fromDate)}</Text>
                  <Text className="text-gray-400 text-xl">›</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className="h-px bg-gray-300 my-4" />

          <View className="mb-4">
            <Text className="text-gray-500 text-md font-medium mb-2">To</Text>
            <TouchableOpacity 
              onPress={openToPicker} 
              className="flex-row items-center justify-between"
              activeOpacity={1}
            >
              <Text className="text-black text-xl font-medium">{formatDate(toDate)}</Text>
              {!isAllDay && (
                <View className="flex-row items-center">
                  <Text className="text-black text-xl font-medium mr-2">{formatTime(toDate)}</Text>
                  <Text className="text-gray-400 text-xl">›</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className="h-px bg-gray-300 my-4" />

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-500 font-medium text-xl">Reminder</Text>
            <View className="rounded-full p-0.5">
              <Switch
                value={enableReminder}
                onValueChange={setEnableReminder}
                trackColor={{ false: '#E5E7EB', true: '#8E9766' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </View>

          {enableReminder && (
            <View className="mb-8">
              <TouchableOpacity 
                onPress={openReminderPicker} 
                className="flex-row items-center justify-between"
                activeOpacity={1}
              >
                <Text className="text-black text-xl font-medium">
                  {calculateTimeDifference(fromDate, reminderTime)}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-black text-xl font-medium mr-2">{formatTime(reminderTime)}</Text>
                  <Text className="text-gray-400 text-xl">›</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        
        <View className="bg-[#EFE4D7] px-5 pb-8">
          <TouchableOpacity 
            className={`rounded-full py-5 items-center ${
              !isFormValid || saving ? 'bg-gray-400' : 'bg-[#8E9766]'
            }`}
            activeOpacity={1}
            onPress={handleSaveEvent}
            disabled={!isFormValid || saving}
          >
            <Text className="text-white text-lg font-semibold">
              {saving ? 'Saving...' : 'Save Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <DateTimePicker
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSave={saveFromDateTime}
        title="Select Start Date & Time"
        tempDate={tempDate}
        onDateSelect={handleDateSelect}
        isAllDay={isAllDay}
        tempTime={tempTime}
        onTimeChange={handleTimeChange}
      />

      <DateTimePicker
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSave={saveToDateTime}
        title="Select End Date & Time"
        tempDate={tempDate}
        onDateSelect={handleDateSelect}
        isAllDay={isAllDay}
        tempTime={tempTime}
        onTimeChange={handleTimeChange}
      />

      <DateTimePicker
        visible={showReminderPicker}
        onClose={() => setShowReminderPicker(false)}
        onSave={saveReminderTime}
        title="Select Reminder Time"
        tempDate={tempDate}
        onDateSelect={handleDateSelect}
        isAllDay={isAllDay}
        tempTime={tempTime}
        onTimeChange={handleTimeChange}
      />
    </SafeAreaView>
  );
}
