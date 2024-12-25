import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { useState, useRef, useEffect } from "react";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay } from "date-fns";
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import Month from "./Month";

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MAX_TRANSLATE_Y = (-SCREEN_HEIGHT / 2) + 80

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

type CalendarProps = {
  bottomSheetTranslationY: SharedValue<number>
}

export default function Calendar({ bottomSheetTranslationY }: CalendarProps) {
  const flatListRef = useRef<FlatList>(null);
  const [selectedDay, setSelectedDay] = useState(new Date())
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfMonth(subMonths(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfMonth(addMonths(new Date(), 1)) },
  ])

  const selectedDayPosition = useSharedValue(0)

  const rTopSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: interpolate(
          bottomSheetTranslationY.value,
          [0, MAX_TRANSLATE_Y],
          [0, -selectedDayPosition.value + 70]
        )
      }],
    }
  })

  const handlePress = (date: Date) => {
    // In here, we just compare date and selectedDay because handleScroll has a stale closure. In other words, even if we set selectedDay to date (which we do below) it won't update for us in here
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.month}>
          <Text style={styles.monthText}>{selectedDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </View>
        <View style={styles.weekdayNames}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>
      </View>
      <View style={{ position: 'absolute', zIndex: 2, top: 0, left: 0 }}>
        <Button title='Log' onPress={() => { console.log(selectedDayPosition.value) }}></Button>
      </View>
      <Animated.View style={[rTopSheetStyle]}>
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={({ item }) => <Month initialDay={item.initialDay} selectedDay={selectedDay} handlePress={handlePress} selectedDayPosition={selectedDayPosition} />}
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
              console.log('Fully visible item:', item.item.initialDay);
              setSelectedDay(item.item.initialDay)
            });
          }}
        />
      </Animated.View>
      {/* <Text>selectedDay: {JSON.stringify(selectedDay, null, 2)}</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <Button title="Today" onPress={scrollToToday} />
      <Button title="Previous" onPress={scrollToPrevious} />
      <Button title="Next" onPress={scrollToNext} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white',
    paddingTop: 50
  },
  header: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    backgroundColor: 'white'
  },
  month: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  monthText: {
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
