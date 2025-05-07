import { View, StyleSheet, Button, Text, Platform } from "react-native";
import { useState, useRef, useEffect } from "react";
import { runOnJS, SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CalendarProvider } from "./CalendarContext";
import Header from "./Header";
import MonthView from "./MonthView";
import WeekView from "./WeekView";

type CalendarProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
}

export default function Calendar({ bottomSheetTranslationY, calendarBottom }: CalendarProps) {
  let startOfToday = new Date(new Date().toDateString())
  // const [selectedDate, setSelectedDate] = useState(startOfToday)
  const selectedDatePosition = useSharedValue(0)
  const insets = useSafeAreaInsets()
  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }

  // const [monthView, setMonthView] = useState(true)
  const [weekView, setWeekView] = useState(true)

  useAnimatedReaction(
    () => { return bottomSheetTranslationY.value },
    (currentValue, previousValue) => {
      if (currentValue < -117.5) {
        runOnJS(setWeekView)(true)
      }
      else if (currentValue > -117.5) {
        runOnJS(setWeekView)(false)
      }
    }
  );

  return (
    <CalendarProvider>
      <View style={[
        styles.container,
        {
          paddingTop: topPadding,
          paddingBottom: insets.bottom
        }
      ]}>
        <Header />
        <WeekView
          bottomSheetTranslationY={bottomSheetTranslationY}
          selectedDatePosition={selectedDatePosition}
        />
        <MonthView
          bottomSheetTranslationY={bottomSheetTranslationY}
          calendarBottom={calendarBottom}
          selectedDatePosition={selectedDatePosition}
        />
      </View>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
