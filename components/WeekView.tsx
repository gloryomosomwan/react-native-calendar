import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, isSameWeek, getWeek } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate, useDerivedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Week from "./Week"
import { useCalendar } from "./CalendarContext";

const EXPANDED_MODE_THRESHOLD = -235

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type WeekViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  // selectedDate: Date
  // setSelectedDate: (date: Date) => void
  selectedDatePosition: SharedValue<number>
  dateOfDisplayedMonth: Date
  setDateOfDisplayedMonth: (date: Date) => void
}

export default function WeekView({ bottomSheetTranslationY, dateOfDisplayedMonth, selectedDatePosition, setDateOfDisplayedMonth }: WeekViewProps) {
  let startOfToday = new Date(new Date().toDateString())

  const { calendarState } = useCalendar()
  let selectedDate = calendarState.currentDate

  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfWeek(subWeeks(selectedDate, 1)) },
    { id: generateUniqueId(), initialDay: selectedDate },
    { id: generateUniqueId(), initialDay: startOfWeek(addWeeks(selectedDate, 1)) },
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

  useEffect(() => {
    console.log('rendered')
  })

  const currentMode = useDerivedValue(() => {
    return bottomSheetTranslationY.value > EXPANDED_MODE_THRESHOLD
      ? 'expanded'
      : 'collapsed'
  })

  const fetchPreviousWeek = () => {
    let newDay = startOfWeek(subWeeks(data[0].initialDay, 1));
    if (isSameWeek(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setData(prevData => {
      const newData = [...prevData];
      newData.unshift({ id: generateUniqueId(), initialDay: newDay });
      newData.pop();
      return newData;
    });
  }

  const fetchNextWeek = () => {
    let newDay = startOfWeek(addWeeks(data[data.length - 1].initialDay, 1))
    if (isSameWeek(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setData(prevData => {
      const newData = [...prevData];
      newData.push({ id: generateUniqueId(), initialDay: newDay });
      newData.shift();
      return newData;
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
        setData(prevData => {
          const newData = [...prevData];
          newData[0] = { id: generateUniqueId(), initialDay: startOfToday }
          return newData;
        });
        scrollToPreviousWeek('animated')
        setData(prevData => {
          const newData = [...prevData]
          newData[2] = { id: generateUniqueId(), initialDay: startOfWeek(addWeeks(startOfToday, 1)) }
          return newData
        })
      }
      else if (isInLaterWeek(startOfToday, selectedDate)) {
        setData(prevData => {
          const newData = [...prevData];
          newData[2] = { id: generateUniqueId(), initialDay: startOfToday }
          return newData;
        });
        scrollToNextWeek('animated')
        setData(prevData => {
          const newData = [...prevData]
          newData[0] = { id: generateUniqueId(), initialDay: startOfWeek(subWeeks(startOfToday, 1)) }
          return newData
        })
      }
    }
    else if (isSameWeek(startOfToday, selectedDate)) {
      // setSelectedDate(startOfToday)
      calendarState.selectDate(startOfToday)
    }
  }

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDate because handlePress has a stale closure. In other words, even if we set selectedDate to date (which we do below) it won't update for us in here
    // setSelectedDate(date)
    calendarState.selectDate(date)

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
      // opacity: bottomSheetTranslationY.value === -235 ? 1 : 0
      opacity: interpolate(
        bottomSheetTranslationY.value,
        [-117, -235],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  // const handlePress1 = () => {
  //   calendarState.selectDate(new Date(2025, 5))
  // };

  return (
    // 30 (size of header) + 5 (header margin) + 17 (weekday name text height)
    <Animated.View style={[rWeekViewStyle, styles.weekContainer, { paddingTop: topPadding + 30 + 5 + 17 }]}>

      {/* <View style={{ position: 'absolute', top: 310, zIndex: 3 }}>
        <Button title='Today (Week)' onPress={handlePress1} />
      </View> */}

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => (
          <Week
            initialDay={item.initialDay}
            // selectedDate={selectedDate}
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
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            setDateOfDisplayedMonth(item.item.initialDay)
            // setSelectedDate(item.item.initialDay)
            calendarState.selectDate(item.item.initialDay)
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
