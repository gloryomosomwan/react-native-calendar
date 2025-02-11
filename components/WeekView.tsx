import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, Extrapolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Week from "./Week"

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type WeekViewProps = {
  bottomSheetTranslationY: SharedValue<number>
  selectedDay: Date
  setSelectedDay: (date: Date) => void
  selectedDayPosition: SharedValue<number>
  dateOfDisplayedMonth: Date
  setDateOfDisplayedMonth: (date: Date) => void
  scrollToPreviousMonth: () => void
  scrollToNextMonth: () => void
}

const WeekView = forwardRef<{ scrollToPrevious: () => void; scrollToNext: () => void }, WeekViewProps>(({ bottomSheetTranslationY, selectedDay, setSelectedDay, selectedDayPosition, dateOfDisplayedMonth, setDateOfDisplayedMonth, scrollToPreviousMonth, scrollToNextMonth }: WeekViewProps, ref) => {
  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfWeek(subWeeks(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfWeek(addWeeks(new Date(), 1)) },
  ])
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets()

  useImperativeHandle(ref, () => ({
    scrollToPrevious,
    scrollToNext
  }));

  const fetchPrevious = () => {
    const newDay = startOfWeek(subWeeks(data[0].initialDay, 1))
    setData(prevData => {
      const newData = [...prevData]
      newData.unshift({ id: generateUniqueId(), initialDay: newDay })
      newData.pop()
      return newData
    })
  }

  const fetchNext = () => {
    const newDay = startOfWeek(addWeeks(data[data.length - 1].initialDay, 1))
    setData(prevData => {
      const newData = [...prevData]
      newData.push({ id: generateUniqueId(), initialDay: newDay })
      newData.shift()
      return newData
    })
  }

  const scrollToPrevious = () => {
    console.log('polo')
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


  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDay because handlePress has a stale closure. In other words, even if we set selectedDay to date (which we do below) it won't update for us in here
    setSelectedDay(date)
    // if (!isSameDay(date, selectedDay)) {
    //   if (isInLaterMonth(date, selectedDay)) {
    //     data[2].initialDay = date
    //     scrollToNext()
    //   }
    //   else if (isInEarlierMonth(date, selectedDay)) {
    //     data[0].initialDay = date
    //     scrollToPrevious()
    //   }
    // }
  }

  const rWeekViewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        bottomSheetTranslationY.value,
        [-235, -234],
        [1, 0],
        Extrapolate.CLAMP
      ),
      pointerEvents: bottomSheetTranslationY.value <= -235 ? 'auto' : 'none',
    };
  });

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90, // Percentage of item that needs to be visible
    minimumViewTime: 5, // Minimum time (ms) an item must be visible to trigger
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
    <Animated.View style={[styles.weekContainer, rWeekViewStyle, { paddingTop: insets.top + 30 + 5 + 17 }]}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => (
          <Week
            initialDay={item.initialDay}
            selectedDay={selectedDay}
            selectedDayPosition={selectedDayPosition}
            dateOfDisplayedMonth={dateOfDisplayedMonth}
            handlePress={handlePress}
            bottomSheetTranslationY={bottomSheetTranslationY}
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
            // If month of the new day is previous to the current day, scroll the Month back
            // Likewise for in the forward direction

            if (isInEarlierMonth(item.item.initialDay, selectedDay)) {
              scrollToPreviousMonth();
            }
            else if (isInLaterMonth(item.item.initialDay, selectedDay)) {
              scrollToNextMonth();
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