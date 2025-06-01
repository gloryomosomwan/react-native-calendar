import { View, StyleSheet, Platform } from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";
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
    <CalendarProvider>
      <View style={[
        styles.container,
        {
          paddingTop: topPadding,
          paddingBottom: insets.bottom
        }
      ]}>
        <Header />
        {/* <WeekView
          bottomSheetTranslationY={bottomSheetTranslationY}
          selectedDatePosition={selectedDatePosition}
        /> */}
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
