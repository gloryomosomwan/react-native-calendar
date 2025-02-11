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
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [dateOfDisplayedMonth, setDateOfDisplayedMonth] = useState(new Date())
  const selectedDayPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()

  const monthViewRef = useRef<{ scrollToPrevious: () => void; scrollToNext: () => void } | null>(null)
  const weekViewRef = useRef<{ scrollToPrevious: () => void; scrollToNext: () => void } | null>(null)

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }
    ]}>
      {/* <View style={{ position: 'absolute', zIndex: 2, top: 20, left: 0, flex: 1, flexDirection: 'row' }}>
        <Button title='SV' onPress={() => { console.log('SelectedDay Position', insets.top) }}></Button>
        <Button title='TV' onPress={() => { console.log('Top Row Position:', topRowPosition.value) }}></Button>
      </View> */}
      <Header
        selectedDay={selectedDay}
      />
      <WeekView
        ref={weekViewRef}
        bottomSheetTranslationY={bottomSheetTranslationY}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedDayPosition={selectedDayPosition}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        setDateOfDisplayedMonth={setDateOfDisplayedMonth}
        scrollToPreviousMonth={() => monthViewRef?.current?.scrollToPrevious()}
        scrollToNextMonth={() => monthViewRef?.current?.scrollToNext()}
      />
      <MonthView
        ref={monthViewRef}
        bottomSheetTranslationY={bottomSheetTranslationY}
        calendarBottom={calendarBottom}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedDayPosition={selectedDayPosition}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        setDateOfDisplayedMonth={setDateOfDisplayedMonth}
        scrollToPreviousWeek={() => weekViewRef?.current?.scrollToPrevious()}
        scrollToNextWeek={() => weekViewRef?.current?.scrollToNext()}
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
