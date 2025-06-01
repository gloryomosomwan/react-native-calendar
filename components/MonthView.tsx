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
  let startOfToday = new Date(new Date().toDateString())

  const { calendarState } = useCalendar()
  const [selectedDate, setSelectedDate] = useState(calendarState.currentDate)
  const sv = useSharedValue(false)


  const monthId = (date: Date) => startOfMonth(date).toISOString() + 'lol';

  // const [data, setData] = useState([
  //   { id: monthId(subMonths(selectedDate, 1)), initialDay: startOfMonth(subMonths(selectedDate, 1)) },
  //   { id: monthId(selectedDate), initialDay: selectedDate },
  //   { id: monthId(addMonths(selectedDate, 1)), initialDay: startOfMonth(addMonths(selectedDate, 1)) },
  // ])

  const data = useMemo(() => [
    { id: monthId(subMonths(selectedDate, 1)), initialDay: startOfMonth(subMonths(selectedDate, 1)) },
    { id: monthId(selectedDate), initialDay: selectedDate },
    { id: monthId(addMonths(selectedDate, 1)), initialDay: startOfMonth(addMonths(selectedDate, 1)) },
  ], [selectedDate])

  useEffect(() => {
    console.log('selectedDate changed')
  }, [selectedDate])

  useEffect(() => {
    const unsubscribe = calendarState.subscribe(() => {
      if (manualScrollAnimation.current === false) {
        setSelectedDate(calendarState.currentDate)
        // if (!isSameDay(calendarState.currentDate, calendarState.previousDate)) {
        //   // setSelectedDate(calendarState.currentDate)
        // }

        // // if (calendarState.dayPressed === true) {
        // if (isInEarlierMonth(calendarState.currentDate, calendarState.previousDate)) {
        //   scrollToPreviousMonth()
        // }
        // else if (isInLaterMonth(calendarState.currentDate, calendarState.previousDate)) {
        //   console.log(data[2])
        //   scrollToNextMonth()
        // }
        // // }

      }
    })
    return unsubscribe
  }, [])

  const dayPressed = useRef<boolean>(false);

  useEffect(() => {
    const dayUnsubscribe = calendarState.daySubscribe(() => {
      if (!isSameDay(calendarState.currentDate, calendarState.previousDate)) {
        console.log('dayPressed set to true ')
        dayPressed.current = true
        if (isInEarlierMonth(calendarState.currentDate, calendarState.previousDate)) {
          // data[0].initialDay = calendarState.currentDate
          scrollToPreviousMonth('animated')
        }
        else if (isInLaterMonth(calendarState.currentDate, calendarState.previousDate)) {
          // data[2].initialDay = calendarState.currentDate
          scrollToNextMonth('animated')
        }
        dayPressed.current = false
        console.log('dayPressed set to false')
        setTimeout(() => {
          // setSelectedDate(calendarState.currentDate)
        }, 100)
      }
    })
    return dayUnsubscribe
  }), []

  const flatListRef = useRef<FlatList>(null);
  const topRowPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()
  const manualScrollAnimation = useRef<boolean>(false)

  const setCalendarBottom = (y: number) => {
    calendarBottom.value = y
  }

  useEffect(() => {
    if (Platform.OS === 'ios') {
      topRowPosition.value = insets.top
    }
    else if (Platform.OS === 'android') {
      topRowPosition.value = 0
    }
  })

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
    console.log('fetching previous month')
    // let newDay = startOfMonth(subMonths(selectedDate, 1));
    // if (isSameMonth(newDay, startOfToday)) {
    //   newDay = startOfToday
    // }

    setSelectedDate(prevDate => {
      console.log('setting selected date in fetchPreviousMonth')
      // const newDate = new Date(prevDate);
      // newDate.setMonth(prevDate.getMonth() - 1);
      let newDate = startOfMonth(subMonths(prevDate, 1))
      if (isSameDay(newDate, startOfMonth(startOfToday))) {
        newDate = startOfToday
      }
      return newDate;
    });

    // setData(prevData => {
    //   const newData = [...prevData];
    //   newData.unshift({ id: monthId(newDay), initialDay: newDay });
    //   newData.pop();
    //   return newData;
    // });
  }

  const fetchNextMonth = () => {
    console.log('fetching next month')
    // let newDay = startOfMonth(addMonths(selectedDate, 1))
    // if (isSameMonth(newDay, startOfToday)) {
    //   newDay = startOfToday
    // }

    setSelectedDate(prevDate => {
      console.log('setting selectedDate in fetchNextMonth')
      // const newDate = new Date(prevDate)
      // newDate.setMonth(prevDate.getMonth() + 1)
      let newDate = startOfMonth(addMonths(prevDate, 1))
      if (isSameDay(newDate, startOfMonth(startOfToday))) {
        newDate = startOfToday
      }
      return newDate;
    })

    // setData(prevData => {
    //   const newData = [...prevData];
    //   newData.push({ id: monthId(newDay), initialDay: newDay });
    //   newData.shift();
    //   return newData;
    // });
  }

  const scrollToPreviousMonth = (mode?: string) => {
    console.log('scrolling to previous month')
    if (flatListRef.current) {
      if (mode === 'animated') {
        flatListRef?.current?.scrollToIndex({
          index: 0
        });
      }
      else {
        flatListRef?.current?.scrollToIndex({
          index: 0,
          animated: false
        })
      }
    }
    manualScrollAnimation.current = false
  };

  const scrollToNextMonth = (mode?: string) => {
    console.log('scrolling to next month')
    manualScrollAnimation.current = true
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
    manualScrollAnimation.current = false
  };

  // const scrollToToday = () => {
  //   if (!isSameMonth(startOfToday, selectedDate)) {
  //     if (isInLaterMonth(startOfToday, selectedDate)) {
  //       setData(prevData => {
  //         const newData = [...prevData];
  //         newData.pop();
  //         newData.push({ id: generateUniqueId(), initialDay: startOfToday });
  //         return newData;
  //       });
  //       scrollToNextMonth('animated')
  //       setData(prevData => {
  //         const newData = [...prevData];
  //         newData[1].initialDay = startOfMonth(subMonths(startOfToday, 1))
  //         return newData;
  //       });
  //     }
  //     else if (isInEarlierMonth(startOfToday, selectedDate)) {
  //       setData(prevData => {
  //         const newData = [...prevData];
  //         newData.shift();
  //         newData.unshift({ id: generateUniqueId(), initialDay: startOfToday });
  //         return newData;
  //       });
  //       scrollToPreviousMonth('animated')
  //       setData(prevData => {
  //         const newData = [...prevData];
  //         newData[1].initialDay = startOfMonth(addMonths(startOfToday, 1))
  //         return newData;
  //       });
  //     }
  //   }
  //   else if (isSameMonth(startOfToday, selectedDate)) {
  //     calendarState.selectDate(startOfToday)
  //   }
  // }

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 100, // Percentage of item that needs to be visible
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
      // pointerEvents: sv.value === false ? 'auto' : 'none',
    };
  });

  const synchronizeCalendarState = () => {
    const visibleMonthDate = data[1].initialDay // middle item is always the visible month

    if (!isSameMonth(visibleMonthDate, calendarState.currentDate)) {
      calendarState.selectPreviousDate(calendarState.currentDate)
      calendarState.selectDate(visibleMonthDate)
      calendarState.setDayOfDisplayedMonth(visibleMonthDate)
      setSelectedDate(visibleMonthDate)
      console.log('month sync')
    }
  }

  useEffect(() => {
    if (manualScrollAnimation.current === false && dayPressed.current === false) {
      if (flatListRef.current) {
        console.log('correction')
        // flatListRef.current.scrollToIndex({ index: 1, animated: false });
      }
    }
  }, [selectedDate]);

  return (
    // <GestureDetector gesture={panGesture}>
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
        <Button title='data' onPress={() => { console.log(data) }} />
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
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(data, index) => (
          { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
        )}
        // onStartReached={fetchPreviousMonth}
        // onStartReachedThreshold={0.2}
        // onEndReached={fetchNextMonth}
        // onEndReachedThreshold={0.2}
        // initialScrollIndex={1}
        // initialNumToRender={3}
        decelerationRate={'normal'}
        windowSize={5}
        maintainVisibleContentPosition={{
          minIndexForVisible: 1,
          autoscrollToTopThreshold: undefined
        }}
        onMomentumScrollBegin={() => {
          manualScrollAnimation.current = true
          sv.value = true
          console.trace('scroll start')
        }}
        onMomentumScrollEnd={(e) => {
          console.trace('scroll end')
          if (manualScrollAnimation.current === true) {
            synchronizeCalendarState()
          }
          manualScrollAnimation.current = false
          dayPressed.current = false
          sv.value = false
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            if (manualScrollAnimation.current === true) {
              calendarState.selectPreviousDate(calendarState.currentDate)
              calendarState.selectDate(item.item.initialDay)
              calendarState.setDayOfDisplayedMonth(item.item.initialDay)
              console.log('viewable')
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
    // </GestureDetector >
  )
}

const styles = StyleSheet.create({})