import { View, StyleSheet, Button, Text } from "react-native";
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

  const monthViewRef = useRef<{ scrollToPrevious: () => void; scrollToNext: () => void } | null>(null)
  const weekViewRef = useRef<{ scrollToPrevious: () => void; scrollToNext: () => void; setInitialData: (day: Date) => void } | null>(null)

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
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
        scrollToPreviousMonth={() => monthViewRef?.current?.scrollToPrevious()}
        scrollToNextMonth={() => monthViewRef?.current?.scrollToNext()}
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
        scrollToPreviousWeek={() => weekViewRef?.current?.scrollToPrevious()}
        scrollToNextWeek={() => weekViewRef?.current?.scrollToNext()}
        setInitialData={(day: Date) => weekViewRef?.current?.setInitialData(day)}
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
