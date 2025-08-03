import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate } from '../utils/dateUtils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
}) => {
  const { currentTheme } = useTheme();
  const [showCalendar, setShowCalendar] = useState(false);

  const getMarkedDates = () => {
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: currentTheme.colors.primary,
      },
    };
  };

  const handleDateSelect = (date: string) => {
    onDateChange(date);
    setShowCalendar(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        날짜 선택
      </Text>
      
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
          },
        ]}
        onPress={() => setShowCalendar(true)}
      >
        <Text style={[styles.dateText, { color: currentTheme.colors.text }]}>
          {formatDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
              날짜 선택
            </Text>
            
            <Calendar
              current={selectedDate}
              onDayPress={day => handleDateSelect(day.dateString)}
              markedDates={getMarkedDates()}
              minDate={minDate}
              maxDate={maxDate}
              theme={{
                backgroundColor: currentTheme.colors.surface,
                calendarBackground: currentTheme.colors.surface,
                textSectionTitleColor: currentTheme.colors.text,
                selectedDayBackgroundColor: currentTheme.colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: currentTheme.colors.primary,
                dayTextColor: currentTheme.colors.text,
                textDisabledColor: currentTheme.colors.textSecondary,
                dotColor: currentTheme.colors.primary,
                selectedDotColor: '#ffffff',
                arrowColor: currentTheme.colors.primary,
                monthTextColor: currentTheme.colors.text,
                indicatorColor: currentTheme.colors.primary,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
            
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: currentTheme.colors.primary },
              ]}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DateSelector; 