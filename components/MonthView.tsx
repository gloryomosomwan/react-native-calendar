import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks, differenceInCalendarWeeks } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Month from "./Month";

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type MonthViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
  selectedDay: Date
  setSelectedDay: (date: Date) => void
  selectedDayPosition: SharedValue<number>
  dateOfDisplayedMonth: Date
  setDateOfDisplayedMonth: (date: Date) => void
  scrollToPreviousWeek: () => void
  scrollToNextWeek: () => void
}

const MonthView = forwardRef<{ scrollToPrevious: () => void; scrollToNext: () => void }, MonthViewProps>(({ bottomSheetTranslationY, calendarBottom, selectedDay, setSelectedDay, selectedDayPosition, dateOfDisplayedMonth, setDateOfDisplayedMonth, scrollToPreviousWeek, scrollToNextWeek }: MonthViewProps, ref) => {
  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfMonth(subMonths(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfMonth(addMonths(new Date(), 1)) },
  ])
  const flatListRef = useRef<FlatList>(null);
  const topRowPosition = useSharedValue(0)
  const insets = useSafeAreaInsets()

  const setCalendarBottom = (y: number) => {
    calendarBottom.value = y
  }

  useImperativeHandle(ref, () => ({
    scrollToPrevious,
    scrollToNext
  }));

  useEffect(() => {
    topRowPosition.value = insets.top
    scrollToPreviousWeek()
  }, [])

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDay because handlePress has a stale closure. In other words, even if we set selectedDay to date (which we do below) it won't update for us in here
    setSelectedDay(date)
    if (!isSameDay(date, selectedDay)) {
      if (isInLaterMonth(date, selectedDay)) {
        data[2].initialDay = date
        scrollToNext()
      }
      else if (isInEarlierMonth(date, selectedDay)) {
        data[0].initialDay = date
        scrollToPrevious()
      }
    }
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
        animated: true
      });
    }
  };

  const scrollToNext = () => {
    if (flatListRef.current) {
      flatListRef?.current?.scrollToIndex({
        index: 2,
        animated: true
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
          [0, (topRowPosition.value + 50) - selectedDayPosition.value] // 50 is for the padding
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
            selectedDay={selectedDay}
            selectedDayPosition={selectedDayPosition}
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
            setDateOfDisplayedMonth(item.item.initialDay)
            setSelectedDay(item.item.initialDay)

            if (isInEarlierMonth(item.item.initialDay, selectedDay)) {
              const difference = differenceInCalendarWeeks(selectedDay, item.item.initialDay)
              for (let i = 0; i < difference; i++) {
                scrollToPreviousWeek();
              }
            }
            else if (isInLaterMonth(item.item.initialDay, selectedDay)) {
              const difference = differenceInCalendarWeeks(selectedDay, item.item.initialDay)
              for (let i = 0; i < difference; i++) {
                scrollToNextWeek();
              }
            }
          });
        }}
      />
    </Animated.View>
  )
})

const styles = StyleSheet.create({})

export default MonthView