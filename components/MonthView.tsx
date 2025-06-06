import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform, StatusBar } from "react-native";
import { useState, useRef, useEffect, useMemo } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, isSameMonth } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCalendar } from "./CalendarContext";
import Month from "./Month";

const EXPANDED_MODE_THRESHOLD = -235

type MonthViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
  selectedDatePosition: SharedValue<number>
}

export default function MonthView({ bottomSheetTranslationY, calendarBottom, selectedDatePosition }: MonthViewProps) {
  let startOfToday = new Date()
  startOfToday.setUTCHours(0, 0, 0, 0)

  const { calendarState } = useCalendar()
  const [selectedDate, setSelectedDate] = useState(calendarState.currentDate)
  const monthId = (date: Date) => startOfMonth(date).toISOString();

  const data = useMemo(() => [
    { id: monthId(subMonths(selectedDate, 3)), initialDay: startOfMonth(subMonths(selectedDate, 3)) },
    { id: monthId(subMonths(selectedDate, 2)), initialDay: startOfMonth(subMonths(selectedDate, 2)) },
    { id: monthId(subMonths(selectedDate, 1)), initialDay: startOfMonth(subMonths(selectedDate, 1)) },
    { id: monthId(selectedDate), initialDay: selectedDate },
    { id: monthId(addMonths(selectedDate, 1)), initialDay: startOfMonth(addMonths(selectedDate, 1)) },
    { id: monthId(addMonths(selectedDate, 2)), initialDay: startOfMonth(addMonths(selectedDate, 2)) },
    { id: monthId(addMonths(selectedDate, 3)), initialDay: startOfMonth(addMonths(selectedDate, 3)) },
  ], [selectedDate])

  const manualScrollAnimation = useRef<boolean>(false)
  const dayPressed = useRef<boolean>(false);
  const activeProgrammaticScroll = useSharedValue(false)
  const flatListRef = useRef<FlatList>(null);
  const topRowPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()

  const setCalendarBottom = (y: number) => {
    calendarBottom.value = y
  }

  // throw this in a useMemo?
  useEffect(() => {
    if (Platform.OS === 'ios') {
      topRowPosition.value = insets.top
    }
    else if (Platform.OS === 'android') {
      topRowPosition.value = 0
    }
  })

  useEffect(() => {
    const unsubscribe = calendarState.subscribe(() => {
      if (manualScrollAnimation.current === false) {
        console.log('manualScrollAnimation')
        setSelectedDate(calendarState.currentDate)
        // if (!isSameDay(calendarState.currentDate, calendarState.previousDate)) {
        //   // setSelectedDate(calendarState.currentDate)
        // }
        // // if (calendarState.dayPressed === true) {
        // if (isInEarlierMonth(calendarState.currentDate, calendarState.previousDate)) {
        // scrollToPreviousMonth()
        // }
        // else if (isInLaterMonth(calendarState.currentDate, calendarState.previousDate)) {
        // scrollToNextMonth()
        // }
        // // }
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const dayUnsubscribe = calendarState.daySubscribe(() => {
      if (!isSameDay(calendarState.currentDate, calendarState.previousDate)) {
        // dayPressed.current = true
        setSelectedDate(calendarState.currentDate)

        if (isInEarlierMonth(calendarState.currentDate, calendarState.previousDate)) {
          // activeProgrammaticScroll.value = true
          // scrollToPreviousMonth('animated')
        }
        else if (isInLaterMonth(calendarState.currentDate, calendarState.previousDate)) {
          // activeProgrammaticScroll.value = true
          // scrollToNextMonth('animated')
        }

        setTimeout(() => {
          // dayPressed.current = false
        }, 1000)
      }
    })
    return dayUnsubscribe
  }, [])


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

  const fetchPreviousMonth = () => {
    setSelectedDate(prevDate => {
      // const newDate = new Date(prevDate);
      // newDate.setMonth(prevDate.getMonth() - 1);
      let newDate = startOfMonth(subMonths(prevDate, 1))
      calendarState.selectPreviousDate(calendarState.currentDate)
      calendarState.selectDate(newDate)
      calendarState.setDayOfDisplayedMonth(newDate)
      if (isSameDay(newDate, startOfMonth(startOfToday))) {
        newDate = startOfToday
      }
      return newDate;
    });
  }

  const fetchNextMonth = () => {
    setSelectedDate(prevDate => {
      // const newDate = new Date(prevDate)
      // newDate.setMonth(prevDate.getMonth() + 1)
      let newDate = startOfMonth(addMonths(prevDate, 1))
      calendarState.selectPreviousDate(calendarState.currentDate)
      calendarState.selectDate(newDate)
      calendarState.setDayOfDisplayedMonth(newDate)
      if (isSameDay(newDate, startOfMonth(startOfToday))) {
        newDate = startOfToday
      }
      return newDate;
    })
  }

  const scrollToPreviousMonth = (mode?: string) => {
    if (flatListRef.current) {
      if (mode === 'animated') {
        flatListRef?.current?.scrollToIndex({
          index: 2
        });
      }
      else {
        flatListRef?.current?.scrollToIndex({
          index: 2,
          animated: false,
          viewPosition: 0
        })
      }
    }
  };

  const scrollToNextMonth = (mode?: string) => {
    if (flatListRef.current) {
      if (mode === 'animated') {
        console.log('yoooo')
        flatListRef?.current?.scrollToIndex({
          index: 4,
        });
      }
      else {
        flatListRef?.current?.scrollToIndex({
          index: 4,
          animated: false,
          viewPosition: 0
        })
      }
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90, // Percentage of item that needs to be visible
    minimumViewTime: 10, // Minimum time (ms) an item must be visible to trigger
    // waitForInteraction: true // Wait for scroll to stop before checking
  };

  const rMonthViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: interpolate(
          bottomSheetTranslationY.value,
          [0, EXPANDED_MODE_THRESHOLD],
          [0, (topRowPosition.value + 50) - selectedDatePosition.value] // 50 is for the padding
        )
      }],
      opacity: interpolate(
        bottomSheetTranslationY.value,
        [-117.5, -235],
        [1, 0],
        Extrapolate.CLAMP
      ),
      // pointerEvents: activeProgrammaticScroll.value === false ? 'auto' : 'none',
    };
  });

  const synchronizeCalendarState = () => {
    const visibleMonthDate = data[3].initialDay
    console.log(visibleMonthDate)
    if (!isSameMonth(visibleMonthDate, calendarState.currentDate)) {
      calendarState.selectPreviousDate(calendarState.currentDate)
      calendarState.selectDate(visibleMonthDate)
      calendarState.setDayOfDisplayedMonth(visibleMonthDate)
      setSelectedDate(visibleMonthDate)
    }
  }

  useEffect(() => {
    // if (manualScrollAnimation.current === false && dayPressed.current === false) {
    if (manualScrollAnimation.current === false) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: 3, animated: false });
      }
    }
  }, [selectedDate]);

  return (
    <Animated.View style={[rMonthViewStyle]}>

      <View style={{ position: 'absolute', top: 400, zIndex: 2, left: 10 }}>
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

      <View style={{ position: 'absolute', top: 550, zIndex: 2, left: 10 }}>
        <Text>Previous:</Text>
        <Text>{JSON.stringify(data)}</Text>
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
        <Button title='today' onPress={() => { calendarState.today() }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => (
          <Month
            initialDay={item.initialDay}
            selectedDatePosition={selectedDatePosition}
            bottomSheetTranslationY={bottomSheetTranslationY}
            setCalendarBottom={setCalendarBottom}
          />
        )}
        pagingEnabled
        horizontal={true}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(data, index) => (
          { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
        )}
        // onStartReached={fetchPreviousMonth}
        // onStartReachedThreshold={0.2}
        // onEndReached={fetchNextMonth}
        // onEndReachedThreshold={0.2}
        initialScrollIndex={3}
        // initialNumToRender={3}
        decelerationRate={'normal'}
        windowSize={7}
        maintainVisibleContentPosition={{
          minIndexForVisible: 3,
          autoscrollToTopThreshold: undefined
        }}
        onMomentumScrollBegin={() => {
          manualScrollAnimation.current = true
        }}
        onMomentumScrollEnd={(e) => {
          if (manualScrollAnimation.current === true) {
            synchronizeCalendarState()
          }
          // activeProgrammaticScroll.value = false
          manualScrollAnimation.current = false
          // dayPressed.current = false
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            if (manualScrollAnimation.current === true) {
              calendarState.selectPreviousDate(calendarState.currentDate)
              calendarState.selectDate(item.item.initialDay)
              calendarState.setDayOfDisplayedMonth(item.item.initialDay)
              setSelectedDate(item.item.initialDay)
            }
          });
        }}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({})