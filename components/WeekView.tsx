import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform } from "react-native";
import { useState, useRef, useEffect, useMemo } from "react";
import { isAfter, isBefore, startOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Week from "./Week"
import { useCalendar } from "./CalendarContext";

const EXPANDED_MODE_THRESHOLD = -235

type WeekViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  selectedDatePosition: SharedValue<number>
}

export default function WeekView({ bottomSheetTranslationY, selectedDatePosition }: WeekViewProps) {
  let startOfToday = new Date(new Date().toDateString())

  const { calendarState } = useCalendar()
  const [selectedDate, setSelectedDate] = useState(calendarState.currentDate)

  const weekId = (date: Date) => startOfWeek(date).toISOString();
  const centerWeekStart = startOfWeek(selectedDate);

  const dayPressed = useRef<boolean>(false);

  const weeksData = useMemo(() => [
    { id: weekId(subWeeks(selectedDate, 1)), initialDay: subWeeks(selectedDate, 1) },
    { id: weekId(selectedDate), initialDay: selectedDate },
    { id: weekId(addWeeks(selectedDate, 1)), initialDay: addWeeks(selectedDate, 1) },
  ], [centerWeekStart]);

  useEffect(() => {
    const unsubscribe = calendarState.subscribe(() => {
      if (activeAnimation.current === false) {
        setSelectedDate(calendarState.currentDate)
        // if (isInEarlierWeek(calendarState.currentDate, calendarState.previousDate)) {
        // weeksData[0].initialDay = calendarState.currentDate
        // scrollToPreviousWeek()
        // }
        // else if (isInLaterWeek(calendarState.currentDate, calendarState.previousDate)) {
        // weeksData[2].initialDay = calendarState.currentDate
        // scrollToNextWeek()
        // }
      }
    })
    return unsubscribe
  }, [calendarState.currentDate])

  useEffect(() => {
    const dayUnsubscribe = calendarState.daySubscribe(() => {
      setSelectedDate(calendarState.currentDate)
    })
    return dayUnsubscribe
  }), [calendarState.currentDate]

  const flatListRef = useRef<FlatList>(null);
  const activeAnimation = useRef<boolean>(false)
  const insets = useSafeAreaInsets()

  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }

  const fetchPreviousWeek = () => {
    let newDay = startOfWeek(subWeeks(centerWeekStart, 1));
    if (isSameWeek(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 7);
      return newDate;
    });
  }

  const fetchNextWeek = () => {
    let newDay = startOfWeek(addWeeks(centerWeekStart, 1))
    if (isSameWeek(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + 7);
      return newDate;
    });
  }

  const scrollToPreviousWeek = (mode?: string) => {
    if (flatListRef.current) {
      if (mode === 'animated') {
        flatListRef?.current?.scrollToIndex({
          index: 0,
        });
      }
      else {
        flatListRef?.current?.scrollToIndex({
          index: 0,
          animated: false
        })
      }
    }
  };

  const scrollToNextWeek = (mode?: string) => {
    if (flatListRef.current) {
      if (mode === 'animated') {
        flatListRef?.current?.scrollToIndex({
          index: 2,
        });
      }
      else {
        flatListRef?.current?.scrollToIndex({
          index: 2,
          animated: false
        })
      }
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90, // Percentage of item that needs to be visible
    minimumViewTime: 50, // Minimum time (ms) an item must be visible to trigger
    // waitForInteraction: true // Wait for scroll to stop before checking
  };

  function isInEarlierWeek(dateToCheck: Date, referenceDate: Date) {
    const weekOfDateToCheck = startOfWeek(dateToCheck)
    const weekOfReferenceDate = startOfWeek(referenceDate)
    return isBefore(weekOfDateToCheck, weekOfReferenceDate)
  }

  function isInLaterWeek(dateToCheck: Date, referenceDate: Date) {
    const weekOfDateToCheck = startOfWeek(dateToCheck)
    const weekOfReferenceDate = startOfWeek(referenceDate)
    return isAfter(weekOfDateToCheck, weekOfReferenceDate)
  }

  const rWeekViewStyle = useAnimatedStyle(() => {
    return {
      // opacity: interpolate(
      //   bottomSheetTranslationY.value,
      //   [-117, -235],
      //   [0, 1],
      //   Extrapolate.CLAMP
      // ),
    };
  });

  const synchronizeCalendarState = () => {
    const visibleMonthDate = weeksData[1].initialDay // middle item is always the visible month

    if (!isSameWeek(visibleMonthDate, calendarState.currentDate)) {
      calendarState.selectPreviousDate(calendarState.currentDate)
      calendarState.selectDate(visibleMonthDate)
      calendarState.setDayOfDisplayedMonth(visibleMonthDate)
      setSelectedDate(visibleMonthDate)
    }
  }

  useEffect(() => {
    if (activeAnimation.current === false) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: 1, animated: false });
      }
    }
  }, [centerWeekStart]);

  useEffect(() => {
    if (activeAnimation.current === false && dayPressed.current === false) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: 1, animated: false });
      }
    }
  }, [selectedDate]);

  return (
    <Animated.View style={[rWeekViewStyle, styles.weekContainer, { paddingTop: topPadding + 30 + 5 + 17 }]}>
      {/* 30 (size of header) + 5 (header margin) + 17 (weekday name text height) */}

      {/* <View style={{ position: 'absolute', top: 400, zIndex: 2, left: 10 }}>
        <Text>Selected Date:</Text>
        <Text>{selectedDate.toLocaleString()}</Text>
      </View>

      <View style={{ position: 'absolute', top: 450, zIndex: 2, left: 10 }}>
        <Text>Current:</Text>
        <Text>{calendarState.currentDate.toLocaleString()}</Text>
      </View>

      <View style={{ position: 'absolute', top: 500, zIndex: 2, left: 10 }}>
        <Text>Previous:</Text>
        <Text>{calendarState.previousDate.toLocaleString()}</Text>
      </View>

      <View style={{ position: 'absolute', top: 400, zIndex: 2, left: 240 }}>
        <Button title='selectedDate' onPress={() => { console.log(selectedDate) }} />
      </View>

      <View style={{ position: 'absolute', top: 430, zIndex: 2, left: 240 }}>
        <Button title='currentDate' onPress={() => { console.log(calendarState.currentDate) }} />
      </View>

      <View style={{ position: 'absolute', top: 460, zIndex: 2, left: 240 }}>
        <Button title='previousDate' onPress={() => { console.log(calendarState.previousDate) }} />
      </View>

      <View style={{ position: 'absolute', top: 490, zIndex: 2, left: 240 }}>
        <Button title='data' onPress={() => { console.log(weeksData) }} />
      </View> */}

      <FlatList
        ref={flatListRef}
        data={weeksData}
        renderItem={({ item }) => (
          <Week
            initialDay={item.initialDay}
            selectedDatePosition={selectedDatePosition}
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
        onStartReached={fetchPreviousWeek}
        onStartReachedThreshold={0.2}
        onEndReached={fetchNextWeek}
        onEndReachedThreshold={0.2}
        initialScrollIndex={1}
        // initialNumToRender={3}
        decelerationRate={'normal'}
        windowSize={3}
        maintainVisibleContentPosition={{
          minIndexForVisible: 1,
          autoscrollToTopThreshold: undefined
        }}
        onMomentumScrollBegin={() => {
          activeAnimation.current = true
        }}
        onMomentumScrollEnd={(e) => {
          if (activeAnimation.current === true) {
            // synchronizeCalendarState()
          }
          activeAnimation.current = false
          dayPressed.current = false
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            if (activeAnimation.current === true) {
              calendarState.selectPreviousDate(calendarState.currentDate)
              calendarState.selectDate(item.item.initialDay)
              calendarState.setDayOfDisplayedMonth(item.item.initialDay)
              // setSelectedDate(item.item.initialDay)
            }
          });
        }}
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
