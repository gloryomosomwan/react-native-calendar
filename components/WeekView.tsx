import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform } from "react-native";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
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
  selectedDatePosition: SharedValue<number>
}

export default function WeekView({ bottomSheetTranslationY, selectedDatePosition }: WeekViewProps) {
  let startOfToday = new Date(new Date().toDateString())

  const { calendarState } = useCalendar()
  // let selectedDate = calendarState.currentDate
  const [selectedDate, setSelectedDate] = useState(calendarState.currentDate)

  // Helper to generate a stable id for a week
  const weekId = (date: Date) => startOfWeek(date).toISOString();
  const centerWeekStart = startOfWeek(selectedDate);

  const weeksData = useMemo(() => [
    { id: weekId(subWeeks(centerWeekStart, 1)), initialDay: subWeeks(centerWeekStart, 1) },
    { id: weekId(centerWeekStart), initialDay: centerWeekStart },
    { id: weekId(addWeeks(centerWeekStart, 1)), initialDay: addWeeks(centerWeekStart, 1) },
  ], [centerWeekStart]);

  useEffect(() => {
    const unsubscribe = calendarState.subscribe(() => {
      setSelectedDate(calendarState.currentDate)
    })
    return unsubscribe
  }, [calendarState])

  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets()
  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }

  const currentMode = useDerivedValue(() => {
    return bottomSheetTranslationY.value > EXPANDED_MODE_THRESHOLD
      ? 'expanded'
      : 'collapsed'
  })

  const fetchPreviousWeek = () => {
    let newDay = startOfWeek(subWeeks(centerWeekStart, 1));
    if (isSameWeek(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 7);
      return newDate;
    });
  }

  const fetchNextWeek = () => {
    let newDay = startOfWeek(addWeeks(centerWeekStart, 1))
    if (isSameWeek(newDay, startOfToday)) {
      newDay = startOfToday
    }
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + 7);
      return newDate;
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
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() - 7);
          return newDate;
        });
        scrollToPreviousWeek('animated')
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() + 7);
          return newDate;
        });
      }
      else if (isInLaterWeek(startOfToday, selectedDate)) {
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() + 7);
          return newDate;
        });
        scrollToNextWeek('animated')
        setSelectedDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() - 7);
          return newDate;
        });
      }
    }
    else if (isSameWeek(startOfToday, selectedDate)) {
      // setSelectedDate(startOfToday)
      calendarState.selectDate(startOfToday)
    }
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
      // opacity: interpolate(
      //   bottomSheetTranslationY.value,
      //   [-117, -235],
      //   [0, 1],
      //   Extrapolate.CLAMP
      // ),
    };
  });

  const logState = () => {
    console.log(weeksData)
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 1, animated: false });
    }
  }, [centerWeekStart]);

  return (
    // 30 (size of header) + 5 (header margin) + 17 (weekday name text height)
    <Animated.View style={[rWeekViewStyle, styles.weekContainer, { paddingTop: topPadding + 30 + 5 + 17 }]}>

      {/* <View style={{ position: 'absolute', top: 310, zIndex: 3 }}>
        <Button title='Today (Week)' onPress={logState} />
      </View> */}

      <FlatList
        ref={flatListRef}
        data={weeksData}
        renderItem={({ item }) => (
          <Week
            initialDay={item.initialDay}
            selectedDatePosition={selectedDatePosition}
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
            // calendarState.setDayOfDisplayedMonth(item.item.initialDay)
            // calendarState.selectDate(item.item.initialDay)
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
