import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Week from "./Week"

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type WeekViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  selectedDatePosition: SharedValue<number>
  dateOfDisplayedMonth: Date
  setDateOfDisplayedMonth: (date: Date) => void
  scrollToPreviousMonth: () => void
  scrollToNextMonth: () => void
}

const WeekView = forwardRef<{ scrollToPrevious: () => void; scrollToNext: () => void; setInitialData: (day: Date) => void }, WeekViewProps>(({ bottomSheetTranslationY, selectedDate, setSelectedDate, selectedDatePosition, dateOfDisplayedMonth, setDateOfDisplayedMonth, scrollToPreviousMonth, scrollToNextMonth }: WeekViewProps, ref) => {
  let startOfToday = new Date(new Date().toDateString())
  const [data, setData] = useState(() => {
    const initialWeeks = [];
    for (let i = -208; i <= 208; i++) {
      const weekDate = startOfWeek(addWeeks(startOfToday, i));
      initialWeeks.push({
        id: `$${weekDate.getTime()}`,
        initialDay: weekDate
      });
    }
    return initialWeeks;
  });
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets()

  useImperativeHandle(ref, () => ({
    scrollToPrevious,
    scrollToNext,
    setInitialData
  }));


  const setInitialData = (day: Date) => {
    const newData = [];
    for (let i = -208; i <= 208; i++) {
      const weekDate = startOfWeek(addWeeks(day, i));
      newData.push({
        id: `$${weekDate.getTime()}`,
        initialDay: weekDate
      });
    }
    setData(newData);
  }

  const scrollToPrevious = () => {
    if (flatListRef.current) {
      flatListRef?.current?.scrollToIndex({
        index: 0,
      });
    }
  };

  const scrollToNext = () => {
    if (flatListRef.current) {
      flatListRef?.current?.scrollToIndex({
        index: 2,
      });
    }
  };

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDate because handlePress has a stale closure. In other words, even if we set selectedDate to date (which we do below) it won't update for us in here
    // setSelectedDate(date)
    // if (!isSameDay(date, selectedDate)) {
    //   if (isInLaterMonth(date, selectedDate)) {
    //     data[2].initialDay = date
    //     scrollToNext()
    //   }
    //   else if (isInEarlierMonth(date, selectedDate)) {
    //     data[0].initialDay = date
    //     scrollToPrevious()
    //   }
    // }
  }

  const rWeekViewStyle = useAnimatedStyle(() => {
    return {
      // opacity: interpolate(
      //   bottomSheetTranslationY.value,
      //   [-235, -234],
      //   [1, 0],
      //   Extrapolate.CLAMP
      // ),
      pointerEvents: bottomSheetTranslationY.value <= -235 ? 'auto' : 'none',
    };
  });

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90, // Percentage of item that needs to be visible
    minimumViewTime: 5, // Minimum time (ms) an item must be visible to trigger
    // waitForInteraction: true // Wait for scroll to stop before checking
  };

  function isInEarlierMonth(dateToCheck: Date, referenceDate: Date) {
    const monthOfDateToCheck = startOfMonth(dateToCheck);
    const monthOfReferenceDate = startOfMonth(referenceDate);
    return isBefore(monthOfDateToCheck, monthOfReferenceDate);
  }

  function isInLaterMonth(dateToCheck: Date, referenceDate: Date) {
    const monthOfDateToCheck = startOfMonth(dateToCheck);
    const monthOfReferenceDate = startOfMonth(referenceDate);
    return isAfter(monthOfDateToCheck, monthOfReferenceDate);
  }

  return (
    // 30 (size of header) + 5 (header margin) + 17 (weekday name text height)
    <Animated.View style={[styles.weekContainer, rWeekViewStyle, { paddingTop: insets.top + 30 + 5 + 17 }]}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => (
          <Week
            initialDay={item.initialDay}
            selectedDate={selectedDate}
            selectedDatePosition={selectedDatePosition}
            dateOfDisplayedMonth={dateOfDisplayedMonth}
            handlePress={handlePress}
            bottomSheetTranslationY={bottomSheetTranslationY}
          />
        )}
        pagingEnabled
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(data, index) => (
          { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
        )}
        initialScrollIndex={208}
        decelerationRate={'normal'}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            // setDateOfDisplayedMonth(item.item.initialDay)
            // setSelectedDate(item.item.initialDay)
            // // If month of the new day is previous to the current day, scroll the Month back
            // // Likewise for in the forward direction

            // if (isInEarlierMonth(item.item.initialDay, selectedDate)) {
            //   scrollToPreviousMonth();
            // }
            // else if (isInLaterMonth(item.item.initialDay, selectedDate)) {
            //   scrollToNextMonth();
            // }
          });
        }}
      />
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  weekContainer: {
    position: 'absolute',
    zIndex: 1
  },
})

export default WeekView