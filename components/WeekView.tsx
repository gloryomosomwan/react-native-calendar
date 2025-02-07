import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Week from "./Week"

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type WeekViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
  selectedDay: Date
  setSelectedDay: (date: Date) => void
  selectedDayPosition: SharedValue<number>
  dateOfDisplayedMonth: Date
  setDateOfDisplayedMonth: (date: Date) => void
}

export default function WeekView({ bottomSheetTranslationY, calendarBottom, selectedDay, setSelectedDay, selectedDayPosition, dateOfDisplayedMonth, setDateOfDisplayedMonth }: WeekViewProps) {
  const [weekData, setWeekData] = useState([
    { id: generateUniqueId(), initialDay: startOfWeek(subWeeks(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfWeek(addWeeks(new Date(), 1)) },
  ])
  const insets = useSafeAreaInsets()

  const setCalendarBottom = (y: number) => {
    calendarBottom.value = y
  }

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDay because handlePress has a stale closure. In other words, even if we set selectedDay to date (which we do below) it won't update for us in here
    setSelectedDay(date)
    // if (!isSameDay(date, selectedDay)) {
    //   if (isInLaterMonth(date, selectedDay)) {
    //     data[2].initialDay = date
    //     scrollToNext()
    //   }
    //   else if (isInEarlierMonth(date, selectedDay)) {
    //     data[0].initialDay = date
    //     scrollToPrevious()
    //   }
    // }
  }

  const rWeekViewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        bottomSheetTranslationY.value,
        [-235, -234],
        [1, 0],
        Extrapolate.CLAMP
      ),
      pointerEvents: bottomSheetTranslationY.value <= -235 ? 'auto' : 'none',
    };
  });

  return (
    <Animated.View style={[styles.weekContainer, rWeekViewStyle, { paddingTop: insets.top + 30 + 5 + 17 }]}>
      <FlatList
        data={weekData}
        renderItem={({ item }) => (
          <Week
            initialDay={item.initialDay}
            selectedDay={selectedDay}
            handlePress={handlePress}
            selectedDayPosition={selectedDayPosition}
            setCalendarBottom={setCalendarBottom}
            bottomSheetTranslationY={bottomSheetTranslationY}
            dateOfDisplayedMonth={dateOfDisplayedMonth}
          />
        )}
        pagingEnabled
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(data, index) => (
          { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
        )}
        initialScrollIndex={1}
        decelerationRate={'normal'}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  weekContainer: {
    position: 'absolute',
    zIndex: 1
  },
})