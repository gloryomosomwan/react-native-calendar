import { View, StyleSheet, FlatList, Dimensions, Button, Text, Platform, StatusBar } from "react-native";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay } from "date-fns";
import Animated, { SharedValue, interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Month from "./Month";

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type CalendarProps = {
  bottomSheetTranslationY: SharedValue<number>
  calendarBottom: SharedValue<number>
}

export default function Calendar({ bottomSheetTranslationY, calendarBottom }: CalendarProps) {
  const flatListRef = useRef<FlatList>(null);
  const [selectedDay, setSelectedDay] = useState(new Date())
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // const dateOfDisplayedMonth = useRef<Date>(new Date())
  // let dateOfDisplayedMonth = new Date()
  const [dateOfDisplayedMonth, setDateOfDisplayedMonth] = useState(new Date())

  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfMonth(subMonths(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfMonth(addMonths(new Date(), 1)) },
  ])

  const insets = useSafeAreaInsets()

  const selectedDayPosition = useSharedValue(0)
  const topRowPosition = useSharedValue(0)

  const monthRef = useRef<View | null>(null)

  const [monthView, setMonthView] = useState(true)

  useEffect(() => {
    // if (monthRef.current)
    //   monthRef.current.measure((x, y, width, height, pageX, pageY) => {
    //     // console.log('topRowPosition', topRowPosition.value)
    //     console.log('insets top:', insets.top)
    //     console.log('pageY:', pageY)
    //     topRowPosition.value = pageY
    //   });
    // console.log(insets.top)
    topRowPosition.value = insets.top
  })

  useAnimatedReaction(
    () => { return bottomSheetTranslationY.value },
    (currentValue, previousValue) => {
      // console.log('topRowPosition:', topRowPosition.value)
      if (currentValue <= -235) {
        runOnJS(setMonthView)(false)
      }
      else {
        runOnJS(setMonthView)(true)
      }
    }
  );

  useAnimatedReaction(
    () => { return selectedDayPosition.value },
    (currentValue, previousValue) => {
      // console.log('selectedDayPosition:', selectedDayPosition.value)
    }
  );

  const rTopSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: interpolate(
          bottomSheetTranslationY.value,
          [0, -235],
          [0, (topRowPosition.value + 50) - selectedDayPosition.value]
        )
      }],
    }
  })

  const setCalendarBottom = (y: number) => {
    // console.log('calBotm', calendarBottom.value)
    calendarBottom.value = y
  }

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDay because handlePress has a stale closure. In other words, even if we set selectedDay to date (which we do below) it won't update for us in here
    // console.log('70 - sdpv =', 70 - selectedDayPosition.value)
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
    // if (dateOfDisplayedMonth.current) {
    //   dateOfDisplayedMonth.current = subMonths(dateOfDisplayedMonth.current, 1)
    // }
    // dateOfDisplayedMonth = subMonths(dateOfDisplayedMonth, 1)
    if (flatListRef.current) {
      flatListRef?.current?.scrollToIndex({
        index: 0,
        animated: true
      });
    }
  };

  const scrollToNext = () => {
    // if (dateOfDisplayedMonth.current) {
    //   dateOfDisplayedMonth.current = addMonths(dateOfDisplayedMonth.current, 1)
    // }
    // dateOfDisplayedMonth = addMonths(dateOfDisplayedMonth, 1)
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


  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }
    ]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>

        <View style={styles.month}>
          <Text style={styles.monthName}>{selectedDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </View>

        <View style={styles.weekdayNames}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>

      </View>

      <View style={{ position: 'absolute', zIndex: 2, top: 20, left: 0, flex: 1, flexDirection: 'row' }}>
        <Button title='SV' onPress={() => { console.log('SelectedDay Position', insets.top) }}></Button>
        <Button title='TV' onPress={() => { console.log('Top Row Position:', topRowPosition.value) }}></Button>
      </View>

      <Animated.View style={[rTopSheetStyle]}>
        {monthView &&
          <FlatList
            ref={flatListRef}
            data={data}
            renderItem={({ item }) => <Month ref={monthRef} initialDay={item.initialDay} selectedDay={selectedDay} handlePress={handlePress} selectedDayPosition={selectedDayPosition} setCalendarBottom={setCalendarBottom} bottomSheetTranslationY={bottomSheetTranslationY} dateOfDisplayedMonth={dateOfDisplayedMonth} />}
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
                // if (dateOfDisplayedMonth.current) {
                //   dateOfDisplayedMonth.current = item.item.initialDay
                // }
                // console.log('from Calendar 1:', dateOfDisplayedMonth)
                setDateOfDisplayedMonth(item.item.initialDay)
                // console.log('from Calendar 2:', dateOfDisplayedMonth)
                setSelectedDay(item.item.initialDay)
              });
            }}
          />}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: 'white',
    // height: 100
  },
  header: {
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  month: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  monthName: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 5
  },
  weekdayNames: {
    flexDirection: 'row',
    width: '100%'
  },
  dayName: {
    textAlign: 'center',
    width: Dimensions.get('window').width / 7,
  },
});
