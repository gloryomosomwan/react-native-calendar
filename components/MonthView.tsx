import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform, StatusBar } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, differenceInCalendarWeeks, isSameMonth } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate, useDerivedValue, runOnJS, runOnRuntime, runOnUI } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

import { useCalendar } from "./CalendarContext";
import Month from "./Month";

const EXPANDED_MODE_THRESHOLD = -235

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type MonthViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
  selectedDatePosition: SharedValue<number>
}

export default function MonthView({ bottomSheetTranslationY, calendarBottom, selectedDatePosition }: MonthViewProps) {
  let startOfToday = new Date(new Date().toDateString())

  const { calendarState } = useCalendar()
  const [selectedDate, setSelectedDate] = useState(calendarState.currentDate)

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
    const unsubscribe = calendarState.subscribe(() => {
      if (activeAnimation.current === false) {
        if (!isSameDay(calendarState.currentDate, calendarState.previousDate)) {
          setSelectedDate(calendarState.currentDate)
          if (isInEarlierMonth(calendarState.currentDate, calendarState.previousDate)) {
            // data[0].initialDay = calendarState.currentDate
            // scrollToPreviousMonth('animated')
            // console.log('prev')
          }
          else if (isInLaterMonth(calendarState.currentDate, calendarState.previousDate)) {
            // data[2].initialDay = calendarState.currentDate
            // scrollToNextMonth('animated')
            // console.log('next')
          }
        }
      }
    })
    return unsubscribe
  }, [calendarState])

  const flatListRef = useRef<FlatList>(null);
  const topRowPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()
  const activeAnimation = useRef<boolean>(false)

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
    let newDay = startOfMonth(subMonths(selectedDate, 1));
    if (isSameMonth(newDay, startOfToday)) {
      newDay = startOfToday
    }

    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
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
    let newDay = startOfMonth(addMonths(selectedDate, 1))
    if (isSameMonth(newDay, startOfToday)) {
      newDay = startOfToday
    }

    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() + 1)
      return newDate
    })

    // setData(prevData => {
    //   const newData = [...prevData];
    //   newData.push({ id: monthId(newDay), initialDay: newDay });
    //   newData.shift();
    //   return newData;
    // });
  }

  const scrollToPreviousMonth = (mode?: string) => {
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
  };

  const scrollToNextMonth = (mode?: string) => {
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
    };
  });

  const synchronizeCalendarState = () => {
    const visibleMonthDate = data[1].initialDay // middle item is always the visible month

    if (!isSameMonth(visibleMonthDate, calendarState.currentDate)) {
      console.log('syncing')
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
  }, [selectedDate]);

  // const updateStateToNextMonth = () => {
  //   // setTimeout(() => {
  //   // }, 100)

  //   calendarState.selectPreviousDate(calendarState.currentDate)
  //   calendarState.selectDate(addMonths(calendarState.currentDate, 1))
  //   calendarState.setDayOfDisplayedMonth(addMonths(calendarState.currentDate, 1))
  //   setSelectedDate(calendarState.currentDate)

  //   // setSelectedDate(data[2].initialDay)

  //   scrollToNextMonth('animated')
  // }

  // const updateStateToPreviousMonth = () => {
  //   calendarState.selectPreviousDate(calendarState.currentDate)
  //   calendarState.selectDate(data[0].initialDay)
  //   setSelectedDate(data[0].initialDay)
  //   scrollToPreviousMonth('animated')
  // }

  // let initialTranslationX = useSharedValue(-1);
  // let lastFired = useSharedValue(Date.now()); // Shared value to track the last fired timestamp
  // const THROTTLE_INTERVAL = 350; // Minimum interval in milliseconds

  // const thresholdRef = useRef<boolean>(false);
  // const threshold = useSharedValue(false)

  // const panGesture = Gesture.Pan()
  //   // .onChange 
  //   .onUpdate((e) => {
  //     // const currentTime = Date.now()

  //     // if (currentTime - lastFired.value < THROTTLE_INTERVAL) {
  //     //   return
  //     // }

  //     // if (thresholdRef.current === true) return;
  //     if (threshold.value === true) return;

  //     if (e.translationX < -80) {
  //       // lastFired.value = currentTime

  //       // thresholdRef.current = true
  //       threshold.value = true
  //       runOnJS(updateStateToNextMonth)()
  //     }
  //     else if (e.translationX > 80) {
  //       // lastFired.value = currentTime
  //       // thresholdRef.current = true
  //       threshold.value = true
  //       runOnJS(updateStateToPreviousMonth)();
  //     }
  //   })
  //   .onEnd((e) => {
  //     // console.log('end')
  //     // thresholdRef.current = false
  //     threshold.value = false
  //   })

  // .onTouchesMove((e, stateManager) => {
  //   const currentTime = Date.now();
  //   if (currentTime - lastFired.value < THROTTLE_INTERVAL) {
  //     return; // Skip if the gesture is fired too quickly
  //   }

  //   if (initialTranslationX.value === -1) {
  //     initialTranslationX.value = e.allTouches[0].absoluteX;
  //   } else if ((initialTranslationX.value - e.allTouches[0].absoluteX) > 60) {
  //     stateManager.end();
  //     initialTranslationX.value = -1;
  //     lastFired.value = currentTime; // Update the last fired timestamp
  //     runOnJS(updateStateToNextMonth)();
  //   } else if ((initialTranslationX.value - e.allTouches[0].absoluteX) < -60) {
  //     stateManager.end();
  //     initialTranslationX.value = -1;
  //     lastFired.value = currentTime; // Update the last fired timestamp
  //     runOnJS(updateStateToPreviousMonth)();
  //   }
  // });

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

      <View style={{ position: 'absolute', top: 400, zIndex: 2, left: 300 }}>
        <Button title='Data' onPress={() => { console.log(data) }} />
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
        onStartReached={fetchPreviousMonth}
        onStartReachedThreshold={0.2}
        onEndReached={fetchNextMonth}
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
            synchronizeCalendarState()
          }
          activeAnimation.current = false
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            if (activeAnimation.current === true) {
              calendarState.selectPreviousDate(calendarState.currentDate)
              calendarState.selectDate(item.item.initialDay)
              calendarState.setDayOfDisplayedMonth(item.item.initialDay)
              setSelectedDate(item.item.initialDay)
            }
            else {
              console.log('animation not active')
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