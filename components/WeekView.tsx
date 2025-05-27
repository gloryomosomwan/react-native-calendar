import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, isSameWeek, getWeek } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate, useDerivedValue, runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

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
        console.log('yeah')
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
  }, [calendarState])

  useEffect(() => {
    const dayUnsubscribe = calendarState.daySubscribe(() => {
      setSelectedDate(calendarState.currentDate)
    })
    return dayUnsubscribe
  }), [calendarState]

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

  const scrollToToday = () => {
    if (!isSameWeek(startOfToday, selectedDate)) {
      if (isInEarlierWeek(startOfToday, selectedDate)) {
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() - 7);
          return newDate;
        });
        scrollToPreviousWeek('animated')
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() + 7);
          return newDate;
        });
      }
      else if (isInLaterWeek(startOfToday, selectedDate)) {
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() + 7);
          return newDate;
        });
        scrollToNextWeek('animated')
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() - 7);
          return newDate;
        });
      }
    }
    else if (isSameWeek(startOfToday, selectedDate)) {
      calendarState.selectDate(startOfToday)
    }
  }

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

  useEffect(() => {
    if (activeAnimation.current === false) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: 1, animated: false });
      }
    }
  }, [centerWeekStart]);

  const synchronizeCalendarState = () => {
    const visibleMonthDate = weeksData[1].initialDay // middle item is always the visible month

    if (!isSameWeek(visibleMonthDate, calendarState.currentDate)) {
      calendarState.selectPreviousDate(calendarState.currentDate)
      calendarState.selectDate(visibleMonthDate)
      calendarState.setDayOfDisplayedMonth(visibleMonthDate)
      setSelectedDate(visibleMonthDate)
      console.log('week sync')
    }
  }

  useEffect(() => {
    if (activeAnimation.current === false && dayPressed.current === false) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: 1, animated: false });
      }
    }
  }, [selectedDate]);

  // const updateStateToNextWeek = () => {
  //   calendarState.selectDate(weeksData[2].initialDay)
  // }

  // const updateStateToPreviousWeek = () => {
  //   calendarState.selectDate(weeksData[0].initialDay)
  // }

  // let initialTranslationX = useSharedValue(-1)

  // const panGesture = Gesture.Pan()
  //   .onTouchesMove((e, stateManager) => {
  //     if (initialTranslationX.value === -1) {
  //       initialTranslationX.value = e.allTouches[0].absoluteX
  //     }
  //     if ((initialTranslationX.value - e.allTouches[0].absoluteX) > 50) {
  //       initialTranslationX.value = -1
  //       runOnJS(updateStateToNextWeek)()
  //       runOnJS(scrollToNextWeek)('animated')
  //       stateManager.end()
  //     }
  //     else if ((initialTranslationX.value - e.allTouches[0].absoluteX < -50)) {
  //       initialTranslationX.value = -1
  //       runOnJS(updateStateToPreviousWeek)()
  //       runOnJS(scrollToPreviousWeek)('animated')
  //       stateManager.end()
  //     }
  //   })


  return (
    <Animated.View style={[rWeekViewStyle, styles.weekContainer, { paddingTop: topPadding + 30 + 5 + 17 }]}>
      {/* 30 (size of header) + 5 (header margin) + 17 (weekday name text height) */}

      <View style={{ position: 'absolute', top: 310, zIndex: 3 }}>
        {/* <Button title='Data' onPress={() => console.log(weeksData)} /> */}
        {/* <Text>{weeksData}</Text> */}
      </View>

      <View style={{ position: 'absolute', top: 310, zIndex: 3, left: 130 }}>
        {/* <Text>sel</Text>
        <Text>{calendarState.currentDate.toLocaleString()}</Text> */}
      </View>

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
        initialNumToRender={3}
        decelerationRate={'normal'}
        windowSize={5}
        maintainVisibleContentPosition={{
          minIndexForVisible: 1,
          autoscrollToTopThreshold: undefined
        }}
        onMomentumScrollBegin={() => {
          activeAnimation.current = true
        }}
        onMomentumScrollEnd={(e) => {
          console.log('scroll end')
          if (activeAnimation.current === true) {
            synchronizeCalendarState()
          }
          activeAnimation.current = false
          dayPressed.current = false
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            if (activeAnimation.current === true) {
              // calendarState.selectPreviousDate(calendarState.currentDate)
              // calendarState.selectDate(item.item.initialDay)
              // calendarState.setDayOfDisplayedMonth(item.item.initialDay)
              // setSelectedDate(item.item.initialDay)
            }
            else {
              // console.log('animation not active')
            }
          });
        }}
      // scrollEnabled={false}
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
