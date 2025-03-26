import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform, StatusBar } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, differenceInCalendarWeeks, isSameMonth } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate, useDerivedValue, runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

import Month from "./Month";

const EXPANDED_MODE_THRESHOLD = -235

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type MonthViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  selectedDatePosition: SharedValue<number>
  dateOfDisplayedMonth: Date
  setDateOfDisplayedMonth: (date: Date) => void
  setInitialWeekData: (day: Date, selectedDate: Date) => void
}

const MonthView = forwardRef<{ scrollToPreviousMonth: () => void; scrollToNextMonth: () => void; setInitialMonthData: (day: Date, selectedDate: Date) => void; }, MonthViewProps>(({ bottomSheetTranslationY, calendarBottom, selectedDate, setSelectedDate, selectedDatePosition, dateOfDisplayedMonth, setDateOfDisplayedMonth, setInitialWeekData }: MonthViewProps, ref) => {
  let startOfToday = new Date(new Date().toDateString())

  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfMonth(subMonths(startOfToday, 1)) },
    { id: generateUniqueId(), initialDay: startOfToday },
    { id: generateUniqueId(), initialDay: startOfMonth(addMonths(startOfToday, 1)) },
  ])

  const flatListRef = useRef<FlatList>(null);
  const topRowPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()

  const currentMode = useDerivedValue(() => {
    return bottomSheetTranslationY.value > EXPANDED_MODE_THRESHOLD
      ? 'expanded'
      : 'collapsed'
  })

  const setCalendarBottom = (y: number) => {
    calendarBottom.value = y
  }

  useImperativeHandle(ref, () => ({
    scrollToPreviousMonth,
    scrollToNextMonth,
    setInitialMonthData
  }));

  useEffect(() => {
    if (Platform.OS === 'ios') {
      topRowPosition.value = insets.top
    }
    else if (Platform.OS === 'android') {
      topRowPosition.value = 0
    }
  })

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDate because handlePress has a stale closure. In other words, even if we set selectedDate to date (which we do below) it won't update for us in here
    setSelectedDate(date)
    if (!isSameDay(date, selectedDate)) {
      if (isInLaterMonth(date, selectedDate)) {
        data[2].initialDay = date
        scrollToNextMonth()
      }
      else if (isInEarlierMonth(date, selectedDate)) {
        data[0].initialDay = date
        scrollToPreviousMonth()
      }
    }
    setInitialWeekData(date, selectedDate)
  }

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
    const newDay = startOfMonth(subMonths(data[0].initialDay, 1));
    setData(prevData => {
      const newData = [...prevData];
      newData.unshift({ id: generateUniqueId(), initialDay: newDay });
      newData.pop();
      return newData;
    });
  }

  const fetchNextMonth = () => {
    const newDay = startOfMonth(addMonths(data[data.length - 1].initialDay, 1))
    setData(prevData => {
      const newData = [...prevData];
      newData.push({ id: generateUniqueId(), initialDay: newDay });
      newData.shift();
      return newData;
    });
  }

  const scrollToPreviousMonth = () => {
    if (flatListRef.current) {
      flatListRef?.current?.scrollToIndex({
        index: 0
      });
    }
  };

  const scrollToNextMonth = () => {
    if (flatListRef.current) {
      flatListRef?.current?.scrollToIndex({
        index: 2,
      });
    }
  };

  const scrollToToday = () => {
    if (!isSameMonth(startOfToday, selectedDate)) {
      if (isInLaterMonth(startOfToday, selectedDate)) {
        // setSelectedDate(startOfToday)
        setData(prevData => {
          const newData = [...prevData];
          newData.pop();
          newData.push({ id: generateUniqueId(), initialDay: startOfToday });
          return newData;
        });
        scrollToNextMonth()
        setData(prevData => {
          const newData = [...prevData];
          newData[1].initialDay = startOfMonth(subMonths(startOfToday, 1))
          return newData;
        });
      }
      else if (isInEarlierMonth(startOfToday, selectedDate)) {
        // setSelectedDate(startOfToday)
        setData(prevData => {
          const newData = [...prevData];
          newData.shift();
          newData.unshift({ id: generateUniqueId(), initialDay: startOfToday });
          return newData;
        });
        scrollToPreviousMonth()
        setData(prevData => {
          const newData = [...prevData];
          newData[1].initialDay = startOfMonth(addMonths(startOfToday, 1))
          return newData;
        });
      }
    }
    else if (isSameMonth(startOfToday, selectedDate)) {
      setSelectedDate(startOfToday)
    }
  }

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90, // Percentage of item that needs to be visible
    minimumViewTime: 50, // Minimum time (ms) an item must be visible to trigger
    // waitForInteraction: true // Wait for scroll to stop before checking
  };

  const rMonthViewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        bottomSheetTranslationY.value,
        [EXPANDED_MODE_THRESHOLD, EXPANDED_MODE_THRESHOLD + 1],
        [0, 1],
        Extrapolate.CLAMP
      ),
      transform: [{
        translateY: interpolate(
          bottomSheetTranslationY.value,
          [0, EXPANDED_MODE_THRESHOLD],
          [0, (topRowPosition.value + 50) - selectedDatePosition.value] // 50 is for the padding
        )
      }],
    };
  });

  let initialTranslationX = useSharedValue(-1)

  const panGesture = Gesture.Pan()
    .onTouchesMove((e, stateManager) => {
      if (initialTranslationX.value === -1) {
        initialTranslationX.value = e.allTouches[0].absoluteX
      }
      if ((initialTranslationX.value - e.allTouches[0].absoluteX) > 50) {
        initialTranslationX.value = -1
        runOnJS(scrollToNextMonth)()
        stateManager.end()
      }
      else if ((initialTranslationX.value - e.allTouches[0].absoluteX < -50)) {
        initialTranslationX.value = -1
        runOnJS(scrollToPreviousMonth)()
        stateManager.end()
      }
    })

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const setInitialMonthData = (day: Date, selectedDate: Date) => {
    if (!isSameMonth(day, selectedDate)) {
      if (isInLaterMonth(day, selectedDate)) {
        setSelectedDate(day)
        setData(prevData => {
          const newData = [...prevData];
          newData.pop();
          newData.push({ id: generateUniqueId(), initialDay: day });
          return newData;
        });
        scrollToNextMonth()
        setData(prevData => {
          const newData = [...prevData];
          newData[1].initialDay = startOfMonth(subMonths(day, 1))
          return newData;
        });
      }
      else if (isInEarlierMonth(day, selectedDate)) {
        setSelectedDate(day)
        setData(prevData => {
          const newData = [...prevData];
          newData.shift();
          newData.unshift({ id: generateUniqueId(), initialDay: day });
          return newData;
        });
        scrollToPreviousMonth()
        setData(prevData => {
          const newData = [...prevData];
          newData[1].initialDay = startOfMonth(addMonths(day, 1))
          return newData;
        });
      }
    }
    else if (isSameMonth(day, selectedDate)) {
      setSelectedDate(day)
    }
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[rMonthViewStyle]}>
        <View style={{ position: 'absolute', top: 310, zIndex: 2 }}>
          <Button title='Today (Month)' onPress={scrollToToday} />
        </View>
        <View style={{ position: 'absolute', top: 310, zIndex: 2, left: 250 }}>
          <Button title='Data (Month)' onPress={() => console.log(data)} />
        </View>
        {/* <View style={{ position: 'absolute', top: 40, zIndex: 2, left: 60 }}>
        <Button title='tRP' onPress={() => console.log('tRaP:', topRowPosition.value)} />
      </View> */}
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={({ item }) => (
            <Month
              initialDay={item.initialDay}
              selectedDate={selectedDate}
              selectedDatePosition={selectedDatePosition}
              dateOfDisplayedMonth={dateOfDisplayedMonth}
              handlePress={handlePress}
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
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={(info) => {
            info.viewableItems.forEach(item => {
              if (currentMode.value === 'expanded') {
                setDateOfDisplayedMonth(item.item.initialDay)
                setSelectedDate(item.item.initialDay)

                if (!isSameDay(item.item.initialDay, selectedDate)) {
                  if (timeoutRef.current !== undefined) {
                    clearTimeout(timeoutRef.current)
                  }
                  timeoutRef.current = setTimeout(() => {
                    setInitialWeekData(item.item.initialDay, selectedDate)
                    timeoutRef.current = undefined
                  }, 250);
                }

              }
            });
          }}
          scrollEnabled={false}
        />
      </Animated.View>
    </GestureDetector>
  )
})

const styles = StyleSheet.create({})

export default MonthView