import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay, startOfWeek, addWeeks, subWeeks } from "date-fns";
import Animated, { SharedValue, interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, Extrapolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Month from "./Month";
import Week from "./Week"

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type CalendarProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
}

export default function Calendar({ bottomSheetTranslationY, calendarBottom }: CalendarProps) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const flatListRef = useRef<FlatList>(null);
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [dateOfDisplayedMonth, setDateOfDisplayedMonth] = useState(new Date())

  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfMonth(subMonths(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfMonth(addMonths(new Date(), 1)) },
  ])

  const [weekData, setWeekData] = useState([
    { id: generateUniqueId(), initialDay: startOfWeek(subWeeks(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfWeek(addWeeks(new Date(), 1)) },
  ])

  const selectedDayPosition = useSharedValue(0)
  const topRowPosition = useSharedValue(0)

  const insets = useSafeAreaInsets()

  useEffect(() => {
    topRowPosition.value = insets.top
  })

  const rTopSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: interpolate(
          bottomSheetTranslationY.value,
          [0, -235],
          [0, (topRowPosition.value + 50) - selectedDayPosition.value] // 50 is for the padding
        )
      }],
    }
  })

  const setCalendarBottom = (y: number) => {
    calendarBottom.value = y
  }

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
      pointerEvents: bottomSheetTranslationY.value > -235 ? 'auto' : 'none',
    };
  });

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

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }
    ]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.monthName}>{selectedDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        <View style={styles.weekdayNames}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>
      </View>

      {/* <View style={{ position: 'absolute', zIndex: 2, top: 20, left: 0, flex: 1, flexDirection: 'row' }}>
        <Button title='SV' onPress={() => { console.log('SelectedDay Position', insets.top) }}></Button>
        <Button title='TV' onPress={() => { console.log('Top Row Position:', topRowPosition.value) }}></Button>
      </View> */}

      <Animated.View style={[styles.weekContainer, rWeekViewStyle, { paddingTop: insets.top + 30 + 5 + 17 }]}>
        <FlatList
          data={weekData}
          renderItem={({ item }) => (
            <Week
              initialDay={item.initialDay}
              selectedDay={selectedDay}
              handlePress={handlePress}
              selectedDayPosition={selectedDayPosition}
              setCalendarBottom={setCalendarBottom}
              bottomSheetTranslationY={bottomSheetTranslationY}
              dateOfDisplayedMonth={dateOfDisplayedMonth}
            />
          )}
          pagingEnabled
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          getItemLayout={(data, index) => (
            { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
          )}
          initialScrollIndex={1}
          decelerationRate={'normal'}
        />
      </Animated.View>

      <Animated.View style={[rTopSheetStyle]}>
        <Animated.View style={[styles.monthContainer, rMonthViewStyle]}>
          <FlatList
            ref={flatListRef}
            data={data}
            renderItem={({ item }) => (
              <Month
                initialDay={item.initialDay}
                selectedDay={selectedDay}
                handlePress={handlePress}
                selectedDayPosition={selectedDayPosition}
                setCalendarBottom={setCalendarBottom}
                bottomSheetTranslationY={bottomSheetTranslationY}
                dateOfDisplayedMonth={dateOfDisplayedMonth}
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
              });
            }}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1,
  },
  monthName: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 5
  },
  weekdayNames: {
    flexDirection: 'row',
  },
  dayName: {
    textAlign: 'center',
    width: Dimensions.get('window').width / 7,
  },
  monthContainer: {},
  weekContainer: {
    position: 'absolute',
  },
});
