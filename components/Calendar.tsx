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

  const monthViewRef = useRef<{ scrollToPreviousMonth: () => void; scrollToNextMonth: () => void } | null>(null)
  // const weekViewRef = useRef<{ scrollToPreviousWeek: () => void; scrollToNextWeek: () => void; setInitialData: (day: Date, selectedDate: Date) => void } | null>(null)
  const weekViewRef = useRef<{ setInitialData: (day: Date, selectedDate: Date) => void } | null>(null)

  return (
    <View style={[
      styles.container,
      {
        paddingTop: topPadding,
        paddingBottom: insets.bottom
      }
    ]}>
      {/* <View style={{ position: 'absolute', zIndex: 2, top: 20, left: 0, flex: 1, flexDirection: 'row' }}>
        <Button title='SV' onPress={() => { console.log('selectedDate Position', insets.top) }}></Button>
        <Button title='TV' onPress={() => { console.log('Top Row Position:', topRowPosition.value) }}></Button>
      </View> */}
      <Header
        selectedDate={selectedDate}
      />
      <WeekView
        ref={weekViewRef}
        bottomSheetTranslationY={bottomSheetTranslationY}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDatePosition={selectedDatePosition}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        setDateOfDisplayedMonth={setDateOfDisplayedMonth}
        scrollToPreviousMonth={() => monthViewRef?.current?.scrollToPreviousMonth()}
        scrollToNextMonth={() => monthViewRef?.current?.scrollToNextMonth()}
      />
      <MonthView
        ref={monthViewRef}
        bottomSheetTranslationY={bottomSheetTranslationY}
        calendarBottom={calendarBottom}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDatePosition={selectedDatePosition}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        setDateOfDisplayedMonth={setDateOfDisplayedMonth}
        // scrollToPreviousWeek={() => weekViewRef?.current?.scrollToPreviousWeek()}
        // scrollToNextWeek={() => weekViewRef?.current?.scrollToNextWeek()}
        setInitialData={(day: Date, selectedDate: Date) => weekViewRef?.current?.setInitialData(day, selectedDate)}
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
