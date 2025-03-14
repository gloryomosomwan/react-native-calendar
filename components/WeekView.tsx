import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate, useDerivedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Week from "./Week"

const EXPANDED_MODE_THRESHOLD = -235

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
  // const [data, setData] = useState(() => {
  //   const initialWeeks = [];
  //   for (let i = -208; i <= 208; i++) {
  //     const weekDate = startOfWeek(addWeeks(startOfToday, i));
  //     initialWeeks.push({
  //       id: `$${weekDate.getTime()}`,
  //       initialDay: weekDate
  //     });
  //   }
  //   return initialWeeks;
  // });

  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfWeek(subWeeks(startOfToday, 1)) },
    { id: generateUniqueId(), initialDay: startOfWeek(startOfToday) },
    { id: generateUniqueId(), initialDay: startOfWeek(addWeeks(startOfToday, 1)) },
  ])
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets()
  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }

  useImperativeHandle(ref, () => ({
    scrollToPrevious,
    scrollToNext,
    setInitialData
  }));

  const currentMode = useDerivedValue(() => {
    return bottomSheetTranslationY.value > EXPANDED_MODE_THRESHOLD
      ? 'expanded'
      : 'collapsed'
  })

  const setInitialData = (day: Date) => {
    // console.log(day)
    // const newData = [];
    // for (let i = -208; i <= 208; i++) {
    //   const weekDate = startOfWeek(addWeeks(day, i));
    //   newData.push({
    //     id: `$${weekDate.getTime()}`,
    //     initialDay: weekDate
    //   });
    // }
    // setData(newData);
    // flatListRef.current?.scrollToIndex({
    //   index: 208,
    //   animated: false
    // })

    // setData([
    //   { id: generateUniqueId(), initialDay: startOfWeek(subWeeks(day, 1)) },
    //   { id: generateUniqueId(), initialDay: startOfWeek(day) },
    //   { id: generateUniqueId(), initialDay: startOfWeek(addWeeks(day, 1)) },
    // ])

    // const newDay = startOfWeek(day);
    // setData(prevData => {
    //   const newData = [...prevData];
    //   newData.unshift({ id: generateUniqueId(), initialDay: newDay });
    //   newData.pop();
    //   return newData;
    // });
    // scrollToPrevious()

    const newDay = startOfWeek(day)
    if (!isSameWeek(selectedDate, day)) {
      if (isBefore(day, selectedDate)) {
        setData(prevData => {
          const newData = [...prevData];
          // newData.push({ id: generateUniqueId(), initialDay: newDay });
          // newData.shift();
          newData[0] = { id: generateUniqueId(), initialDay: newDay }
          return newData;
        });
        scrollToPrevious()
      }
      else if (isAfter(day, selectedDate)) {
        setData(prevData => {
          const newData = [...prevData];
          // newData.push({ id: generateUniqueId(), initialDay: newDay });
          // newData.shift();
          newData[2] = { id: generateUniqueId(), initialDay: newDay }
          return newData;
        });
        scrollToNext()
      }
    }
  }

  const fetchPrevious = () => {
    const newDay = startOfWeek(subWeeks(data[0].initialDay, 1));
    setData(prevData => {
      const newData = [...prevData];
      newData.unshift({ id: generateUniqueId(), initialDay: newDay });
      newData.pop();
      return newData;
    });
  }

  const fetchNext = () => {
    const newDay = startOfWeek(addWeeks(data[data.length - 1].initialDay, 1))
    setData(prevData => {
      const newData = [...prevData];
      newData.push({ id: generateUniqueId(), initialDay: newDay });
      newData.shift();
      return newData;
    });
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

  const scrollToToday = () => {
    // if (!isSameMonth(startOfToday, selectedDate)) {
    //   if (isInLaterMonth(startOfToday, selectedDate)) {
    //     setSelectedDate(startOfToday)
    //     setData(prevData => {
    //       const newData = [...prevData];
    //       newData.pop();
    //       newData.push({ id: generateUniqueId(), initialDay: startOfToday });
    //       return newData;
    //     });
    //     scrollToNext()
    //     setData(prevData => {
    //       const newData = [...prevData];
    //       newData[1].initialDay = startOfMonth(subMonths(startOfToday, 1))
    //       return newData;
    //     });
    //   }
    //   else if (isInEarlierMonth(startOfToday, selectedDate)) {
    //     setSelectedDate(startOfToday)
    //     setData(prevData => {
    //       const newData = [...prevData];
    //       newData.shift();
    //       newData.unshift({ id: generateUniqueId(), initialDay: startOfToday });
    //       return newData;
    //     });
    //     scrollToPrevious()
    //     setData(prevData => {
    //       const newData = [...prevData];
    //       newData[1].initialDay = startOfMonth(addMonths(startOfToday, 1))
    //       return newData;
    //     });
    //   }
    // }
    // else if (isSameMonth(startOfToday, selectedDate)) {
    //   setSelectedDate(startOfToday)
    // }
  }

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDate because handlePress has a stale closure. In other words, even if we set selectedDate to date (which we do below) it won't update for us in here
    setSelectedDate(date)
    if (!isSameDay(date, selectedDate)) {
      if (isInLaterMonth(date, selectedDate)) {
        scrollToNextMonth()
      }
      else if (isInEarlierMonth(date, selectedDate)) {
        scrollToPreviousMonth()
      }
    }
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
    minimumViewTime: 50, // Minimum time (ms) an item must be visible to trigger
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
    <Animated.View style={[styles.weekContainer, rWeekViewStyle, { paddingTop: topPadding + 30 + 5 + 17 }]}>
      {/* <View style={{ position: 'absolute', top: 300, zIndex: 2 }}>
        <Button title='today' onPress={scrollToToday} />
      </View> */}
      {/* <View style={{ position: 'absolute', top: 340, zIndex: 2 }}>
        <Button title='DATA' onPress={() => console.log(data)} />
      </View> */}
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
        onStartReached={fetchPrevious}
        onStartReachedThreshold={0.2}
        onEndReached={fetchNext}
        onEndReachedThreshold={0.2}
        initialScrollIndex={1}
        initialNumToRender={3}
        decelerationRate={'normal'}
        windowSize={3}
        maintainVisibleContentPosition={{
          minIndexForVisible: 1,
          autoscrollToTopThreshold: undefined
        }}
        onMomentumScrollEnd={(event) => {
          flatListRef.current?.scrollToIndex({
            index: 1,
            animated: true
          });
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            if (currentMode.value === 'collapsed') {
              setDateOfDisplayedMonth(item.item.initialDay)
              setSelectedDate(item.item.initialDay)
              if (isInEarlierMonth(item.item.initialDay, selectedDate)) {
                scrollToPreviousMonth();
              }
              else if (isInLaterMonth(item.item.initialDay, selectedDate)) {
                scrollToNextMonth();
              }
            }
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