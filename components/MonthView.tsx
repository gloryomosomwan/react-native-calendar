import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform, StatusBar } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, differenceInCalendarWeeks, isSameMonth } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate, useDerivedValue, runOnJS } from "react-native-reanimated";
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

  const monthId = (date: Date) => startOfMonth(date).toISOString();

  const [data, setData] = useState([
    { id: monthId(subMonths(selectedDate, 1)), initialDay: startOfMonth(subMonths(selectedDate, 1)) },
    { id: monthId(selectedDate), initialDay: selectedDate },
    { id: monthId(addMonths(selectedDate, 1)), initialDay: startOfMonth(addMonths(selectedDate, 1)) },
  ])

  useEffect(() => {
    const unsubscribe = calendarState.subscribe(() => {
      if (!isSameDay(calendarState.currentDate, calendarState.previousDate)) {
        setSelectedDate(calendarState.currentDate)
        if (isInEarlierMonth(calendarState.currentDate, calendarState.previousDate)) {
          data[0].initialDay = calendarState.currentDate
          scrollToPreviousMonth('animated')
        }
        else if (isInLaterMonth(calendarState.currentDate, calendarState.previousDate)) {
          data[2].initialDay = calendarState.currentDate
          scrollToNextMonth('animated')
        }
      }
    })
    return unsubscribe
  }, [calendarState])

  const flatListRef = useRef<FlatList>(null);
  const topRowPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()

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
    let newDay = startOfMonth(subMonths(data[0].initialDay, 1));
    if (isSameMonth(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setData(prevData => {
      const newData = [...prevData];
      newData.unshift({ id: generateUniqueId(), initialDay: newDay });
      newData.pop();
      return newData;
    });
  }

  const fetchNextMonth = () => {
    let newDay = startOfMonth(addMonths(data[data.length - 1].initialDay, 1))
    if (isSameMonth(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setData(prevData => {
      const newData = [...prevData];
      newData.push({ id: generateUniqueId(), initialDay: newDay });
      newData.shift();
      return newData;
    });
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

  const scrollToToday = () => {
    if (!isSameMonth(startOfToday, selectedDate)) {
      if (isInLaterMonth(startOfToday, selectedDate)) {
        setData(prevData => {
          const newData = [...prevData];
          newData.pop();
          newData.push({ id: generateUniqueId(), initialDay: startOfToday });
          return newData;
        });
        scrollToNextMonth('animated')
        setData(prevData => {
          const newData = [...prevData];
          newData[1].initialDay = startOfMonth(subMonths(startOfToday, 1))
          return newData;
        });
      }
      else if (isInEarlierMonth(startOfToday, selectedDate)) {
        setData(prevData => {
          const newData = [...prevData];
          newData.shift();
          newData.unshift({ id: generateUniqueId(), initialDay: startOfToday });
          return newData;
        });
        scrollToPreviousMonth('animated')
        setData(prevData => {
          const newData = [...prevData];
          newData[1].initialDay = startOfMonth(addMonths(startOfToday, 1))
          return newData;
        });
      }
    }
    else if (isSameMonth(startOfToday, selectedDate)) {
      calendarState.selectDate(startOfToday)
    }
  }

  // const viewabilityConfig = {
  //   itemVisiblePercentThreshold: 100, // Percentage of item that needs to be visible
  //   minimumViewTime: 100, // Minimum time (ms) an item must be visible to trigger
  //   // waitForInteraction: true // Wait for scroll to stop before checking
  // };

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

  // 
  const updateStateToNextMonth = () => {
    calendarState.selectDate(data[2].initialDay)
  }

  const updateStateToPreviousMonth = () => {
    calendarState.selectDate(data[0].initialDay)
  }

  let initialTranslationX = useSharedValue(-1)

  const panGesture = Gesture.Pan()
    .onTouchesMove((e, stateManager) => {
      if (initialTranslationX.value === -1) {
        initialTranslationX.value = e.allTouches[0].absoluteX
      }
      if ((initialTranslationX.value - e.allTouches[0].absoluteX) > 50) {
        initialTranslationX.value = -1
        runOnJS(updateStateToNextMonth)()
        runOnJS(scrollToNextMonth)('animated')
        stateManager.end()
      }
      else if ((initialTranslationX.value - e.allTouches[0].absoluteX < -50)) {
        initialTranslationX.value = -1
        runOnJS(updateStateToPreviousMonth)()
        runOnJS(scrollToPreviousMonth)('animated')
        stateManager.end()
      }
    })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[rMonthViewStyle]}>

        {/* <View style={{ position: 'absolute', top: 310, zIndex: 2 }}>
          <Text>Current:</Text>
          <Text>{calendarState.currentDate.toLocaleString()}</Text>
        </View>

        <View style={{ position: 'absolute', top: 310, zIndex: 2, left: 190 }}>
          <Text>Previous:</Text>
          <Text>{calendarState.previousDate.toLocaleString()}</Text>
        </View>

        <View style={{ position: 'absolute', top: 70, zIndex: 2, left: 100 }}>
          <Text>Selected Date:</Text>
          <Text>{selectedDate.toLocaleString()}</Text>
        </View> */}

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
          // viewabilityConfig={viewabilityConfig}
          // onViewableItemsChanged={(info) => {
          //   info.viewableItems.forEach(item => {
          //     console.log('item:', item.item.initialDay)
          //     calendarState.selectPreviousDate(calendarState.currentDate)
          //     calendarState.selectDate(item.item.initialDay)
          //   });
          // }}
          scrollEnabled={false}
        />
      </Animated.View>
    </GestureDetector >
  )
}

const styles = StyleSheet.create({})