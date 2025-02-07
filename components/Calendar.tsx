import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MonthView from "./MonthView";
import WeekView from "./WeekView";

type CalendarProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
}

export default function Calendar({ bottomSheetTranslationY, calendarBottom }: CalendarProps) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [dateOfDisplayedMonth, setDateOfDisplayedMonth] = useState(new Date())
  const selectedDayPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }
    ]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.monthName}>{selectedDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        <View style={styles.weekdayNames}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>
      </View>

      {/* <View style={{ position: 'absolute', zIndex: 2, top: 20, left: 0, flex: 1, flexDirection: 'row' }}>
        <Button title='SV' onPress={() => { console.log('SelectedDay Position', insets.top) }}></Button>
        <Button title='TV' onPress={() => { console.log('Top Row Position:', topRowPosition.value) }}></Button>
      </View> */}

      <WeekView
        bottomSheetTranslationY={bottomSheetTranslationY}
        calendarBottom={calendarBottom}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedDayPosition={selectedDayPosition}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        setDateOfDisplayedMonth={setDateOfDisplayedMonth}
      />
      <MonthView
        bottomSheetTranslationY={bottomSheetTranslationY}
        calendarBottom={calendarBottom}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedDayPosition={selectedDayPosition}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        setDateOfDisplayedMonth={setDateOfDisplayedMonth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1,
  },
  monthName: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 5
  },
  weekdayNames: {
    flexDirection: 'row',
  },
  dayName: {
    textAlign: 'center',
    width: Dimensions.get('window').width / 7,
  },
});
