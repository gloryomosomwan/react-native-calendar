import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, differenceInCalendarWeeks } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate, useDerivedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  scrollToPreviousWeek: () => void
  scrollToNextWeek: () => void
  setInitialData: (day: Date) => void
}

const MonthView = forwardRef<{ scrollToPrevious: () => void; scrollToNext: () => void }, MonthViewProps>(({ bottomSheetTranslationY, calendarBottom, selectedDate, setSelectedDate, selectedDatePosition, dateOfDisplayedMonth, setDateOfDisplayedMonth, scrollToPreviousWeek, scrollToNextWeek, setInitialData }: MonthViewProps, ref) => {
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
    scrollToPrevious,
    scrollToNext
  }));

  useEffect(() => {
    topRowPosition.value = insets.top
  }, [])

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDate because handlePress has a stale closure. In other words, even if we set selectedDate to date (which we do below) it won't update for us in here
    setSelectedDate(date)
    if (!isSameDay(date, selectedDate)) {
      if (isInLaterMonth(date, selectedDate)) {
        data[2].initialDay = date
        scrollToNext()
      }
      else if (isInEarlierMonth(date, selectedDate)) {
        data[0].initialDay = date
        scrollToPrevious()
      }
    }
    setInitialData(date)
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

  const fetchPrevious = () => {
    const newDay = startOfMonth(subMonths(data[0].initialDay, 1));
    setData(prevData => {
      const newData = [...prevData];
      newData.unshift({ id: generateUniqueId(), initialDay: newDay });
      newData.pop();
      return newData;
    });
  }

  const fetchNext = () => {
    const newDay = startOfMonth(addMonths(data[data.length - 1].initialDay, 1))
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
        // animated: false
      });
    }
  };

  const scrollToNext = () => {
    if (flatListRef.current) {
      flatListRef?.current?.scrollToIndex({
        index: 2,
        // animated: false
      });
    }
  };

  const scrollToToday = () => {
    setData([
      { id: generateUniqueId(), initialDay: startOfMonth(subMonths(new Date(), 1)) },
      { id: generateUniqueId(), initialDay: new Date() },
      { id: generateUniqueId(), initialDay: startOfMonth(addMonths(new Date(), 1)) },
    ])
  }

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90, // Percentage of item that needs to be visible
    minimumViewTime: 5, // Minimum time (ms) an item must be visible to trigger
    // waitForInteraction: true // Wait for scroll to stop before checking
  };

  const rMonthViewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        bottomSheetTranslationY.value,
        [-235, -234],
        [0, 1],
        Extrapolate.CLAMP
      ),
      transform: [{
        translateY: interpolate(
          bottomSheetTranslationY.value,
          [0, -235],
          [0, (topRowPosition.value + 50) - selectedDatePosition.value] // 50 is for the padding
        )
      }],
      pointerEvents: bottomSheetTranslationY.value > -235 ? 'auto' : 'none',
    };
  });

  return (
    <Animated.View style={[rMonthViewStyle]}>
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
        onStartReached={fetchPrevious}
        onStartReachedThreshold={0.2}
        onEndReached={fetchNext}
        onEndReachedThreshold={0.2}
        bounces={false}
        getItemLayout={(data, index) => (
          { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
        )}
        initialScrollIndex={1}
        decelerationRate={'normal'}
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
              setInitialData(item.item.initialDay)
            }
          });
        }}
      />
    </Animated.View>
  )
})

const styles = StyleSheet.create({})

export default MonthView