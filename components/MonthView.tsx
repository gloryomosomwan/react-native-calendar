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
      setSelectedDate(calendarState.currentDate)
      if (isInEarlierMonth(calendarState.currentDate, calendarState.previousDate)) {
        data[0].initialDay = calendarState.currentDate
        scrollToPreviousMonth('animated')
      }
      else if (isInLaterMonth(calendarState.currentDate, calendarState.previousDate)) {
        data[2].initialDay = calendarState.currentDate
        scrollToNextMonth('animated')
      }
    })
    return unsubscribe
  }, [calendarState])

  // useEffect(() => {
  //   // calendarState.selectDate(date)
  //   // if (!isSameDay(date, selectedDate)) {
  //   //   if (isInLaterMonth(date, selectedDate)) {
  //   //     data[2].initialDay = date
  //   //     scrollToNextMonth()
  //   //   }
  //   //   else if (isInEarlierMonth(date, selectedDate)) {
  //   //     data[0].initialDay = date
  //   //     scrollToPreviousMonth()
  //   //   }
  //   // }

  //   const unsubscribe = calendarState.subscribe(() => {
  //     console.log('selected:', selectedDate)
  //     console.log('calState:', calendarState.currentDate)
  //     console.log(isInEarlierMonth(calendarState.currentDate, selectedDate))

  //     if (isInEarlierMonth(calendarState.currentDate, selectedDate)) {
  //       console.log('insdie')
  //       data[0].initialDay = calendarState.currentDate
  //       scrollToPreviousMonth()
  //     }
  //     else if (isInEarlierMonth(calendarState.currentDate, selectedDate)) {
  //       console.log('insdie')
  //       data[2].initialDay = calendarState.currentDate
  //       scrollToNextMonth()
  //     }

  //   });

  //   return unsubscribe;
  // }, [calendarState])

  const flatListRef = useRef<FlatList>(null);
  const topRowPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()
  const currentIndex = useRef(1)
  const isUserScrolling = useRef(false)
  const lastOffset = useRef(0); // Create a ref to store the last offset

  const currentMode = useDerivedValue(() => {
    return bottomSheetTranslationY.value > EXPANDED_MODE_THRESHOLD
      ? 'expanded'
      : 'collapsed'
  })

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
      // setSelectedDate(startOfToday)
      calendarState.selectDate(startOfToday)
    }
  }

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 100, // Percentage of item that needs to be visible
    minimumViewTime: 100, // Minimum time (ms) an item must be visible to trigger
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
      // opacity: bottomSheetTranslationY.value === -235 ? 0 : 1
      opacity: interpolate(
        bottomSheetTranslationY.value,
        [-117.5, -235],
        [1, 0],
        Extrapolate.CLAMP
      ),
    };
  });


  const handleScrollEnd = (event: any) => {
    console.log(event.nativeEvent.contentOffset.x)
    // if (!isUserScrolling.current) return;

    // const currentOffset = event.nativeEvent.contentOffset.x;
    // console.log('Current Offset:', currentOffset);

    // // Determine the scroll direction
    // const direction = currentOffset > lastOffset.current ? 'right' : 'left';
    // console.log('Scrolled:', direction);

    // // Update the last offset
    // lastOffset.current = currentOffset;

    // // Calculate the new index
    // const newIndex = Math.round(currentOffset / Dimensions.get('window').width);
    // console.log('currentIndex:', currentIndex.current, 'newIndex:', newIndex);

    // if (newIndex !== currentIndex.current) {
    //   console.log('index');
    //   currentIndex.current = newIndex;

    //   if (newIndex === 0) {
    //     calendarState.selectPreviousDate(calendarState.currentDate);
    //     calendarState.selectDate(data[0].initialDay);
    //   } else if (newIndex === 2) {
    //     calendarState.selectPreviousDate(calendarState.currentDate);
    //     calendarState.selectDate(data[2].initialDay);
    //   }
    // }

    // isUserScrolling.current = false;
  };

  const changeStateAsync1 = () => {
    calendarState.selectDate(data[2].initialDay)
  }

  const changeStateAsync2 = () => {
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
        runOnJS(changeStateAsync1)()
        runOnJS(scrollToNextMonth)('animated')
        stateManager.end()
      }
      else if ((initialTranslationX.value - e.allTouches[0].absoluteX < -50)) {
        initialTranslationX.value = -1
        runOnJS(changeStateAsync2)()
        runOnJS(scrollToPreviousMonth)('animated')
        stateManager.end()
      }
    })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[rMonthViewStyle]}>

        <View style={{ position: 'absolute', top: 60, zIndex: 2 }}>
          {/* <Button title='Today (Month)' onPress={scrollToToday} /> */}
          <Text>{selectedDate.toLocaleString()}</Text>
        </View>

        <View style={{ position: 'absolute', top: 40, zIndex: 2, left: 30 }}>
          {/* <Button title='change' onPress={changeState} /> */}
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
          // viewabilityConfig={viewabilityConfig}
          // onViewableItemsChanged={(info) => {
          //   info.viewableItems.forEach(item => {
          //     console.log('item:', item.item.initialDay)
          //     calendarState.selectPreviousDate(calendarState.currentDate)
          //     calendarState.selectDate(item.item.initialDay)
          //   });
          // }}
          // onScroll={handleScroll}
          // onScrollBeginDrag={() => {
          //   isUserScrolling.current = true
          // }}
          // onScrollEndDrag={handleScrollEnd}
          // scrollEventThrottle={16}
          scrollEnabled={false}
        />
      </Animated.View>
    </GestureDetector >
  )
}

const styles = StyleSheet.create({})