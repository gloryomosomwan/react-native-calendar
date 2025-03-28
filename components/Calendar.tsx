import { View, StyleSheet, Button, Text, Platform } from "react-native";
import { useState, useRef, useEffect } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "./Header";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

type CalendarProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
}

export default function Calendar({ bottomSheetTranslationY, calendarBottom }: CalendarProps) {
  let startOfToday = new Date(new Date().toDateString())
  const [selectedDate, setSelectedDate] = useState(startOfToday)
  const [dateOfDisplayedMonth, setDateOfDisplayedMonth] = useState(startOfToday)
  const selectedDatePosition = useSharedValue(0)
  const insets = useSafeAreaInsets()
  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }

  return (
    <View style={[
      styles.container,
      {
        paddingTop: topPadding,
        paddingBottom: insets.bottom
      }
    ]}>
      <Header
        selectedDate={selectedDate}
      />
      <WeekView
        bottomSheetTranslationY={bottomSheetTranslationY}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDatePosition={selectedDatePosition}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        setDateOfDisplayedMonth={setDateOfDisplayedMonth}
      />
      <MonthView
        bottomSheetTranslationY={bottomSheetTranslationY}
        calendarBottom={calendarBottom}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDatePosition={selectedDatePosition}
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
});
