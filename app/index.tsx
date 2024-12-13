import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay } from "date-fns";

import Month from "../components/Month";

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

export default function Index() {
  const flatListRef = useRef<FlatList>(null);
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [visibleDate, setVisibleDate] = useState(new Date())

  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: startOfMonth(subMonths(new Date(), 1)) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: startOfMonth(addMonths(new Date(), 1)) },
  ])

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

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 90, // Percentage of item that needs to be visible
    minimumViewTime: 5, // Minimum time (ms) an item must be visible to trigger
    // waitForInteraction: true // Wait for scroll to stop before checking
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => <Month initialDay={item.initialDay} selectedDay={selectedDay} visibleDate={visibleDate} handlePress={handlePress} />}
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
            setVisibleDate(item.item.initialDay)
            setSelectedDay(item.item.initialDay)
          });
        }}
      />
      <Text>selectedDay: {JSON.stringify(selectedDay, null, 2)}</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <Button title="Previous" onPress={scrollToPrevious} />
      <Button title="Next" onPress={scrollToNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 0,
    backgroundColor: 'white'
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
});
