import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import Month from "../components/Month";
import { addMonths, startOfMonth, isAfter, subMonths, isBefore, isSameDay } from "date-fns";

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

export default function Index() {
  const flatListRef = useRef<FlatList>(null);
  const [previousSelectedDay, setPreviousSelectedDay] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [visibleDate, setVisibleDate] = useState(new Date())
  const [data, setData] = useState([
    { id: generateUniqueId(), initialDay: subMonths(new Date(), 1) },
    { id: generateUniqueId(), initialDay: new Date() },
    { id: generateUniqueId(), initialDay: addMonths(new Date(), 1) },
  ])

  function isInLaterMonth(dateToCheck: Date, referenceDate: Date) {
    // Get the start of the months for both dates
    const monthOfDateToCheck = startOfMonth(dateToCheck);
    const monthOfReferenceDate = startOfMonth(referenceDate);

    // Check if the month of dateToCheck is after the month of referenceDate
    return isAfter(monthOfDateToCheck, monthOfReferenceDate);
  }

  function isInEarlierMonth(dateToCheck: Date, referenceDate: Date) {
    // Get the start of the months for both dates
    const monthOfDateToCheck = startOfMonth(dateToCheck);
    const monthOfReferenceDate = startOfMonth(referenceDate);

    // Check if the month of dateToCheck is after the month of referenceDate
    return isBefore(monthOfDateToCheck, monthOfReferenceDate);
  }

  useEffect(() => {
    if (!isSameDay(selectedDay, previousSelectedDay)) {
      if (isInLaterMonth(selectedDay, previousSelectedDay)) {
        scrollToNext()
      }
      else if (isInEarlierMonth(selectedDay, previousSelectedDay)) {
        scrollToPrevious()
      }
    }
  }, [selectedDay])

  useEffect(() => {
    // console.log('render')
  })

  const fetchPrevious = () => {
    const newDay = subMonths(data[0].initialDay, 1);
    setData(prevData => {
      const newData = [...prevData];
      newData.unshift({ id: generateUniqueId(), initialDay: newDay });
      newData.pop();
      return newData;
    });
  }

  const fetchNext = () => {
    const newDay = addMonths(data[data.length - 1].initialDay, 1)
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
    itemVisiblePercentThreshold: 50, // Percentage of item that needs to be visible
    minimumViewTime: 40, // Minimum time (ms) an item must be visible to trigger
    // waitForInteraction: true // Wait for scroll to stop before checking
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => <Month initialDay={item.initialDay} selectedDay={selectedDay} setSelectedDay={setSelectedDay} setPreviousSelectedDay={setPreviousSelectedDay} visibleDate={visibleDate} />}
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
        decelerationRate={'fast'}
        maintainVisibleContentPosition={{
          minIndexForVisible: 1,
          autoscrollToTopThreshold: undefined
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={(info) => {
          info.viewableItems.forEach(item => {
            console.log('Fully visible item:', item.item.initialDay);
            setVisibleDate(item.item.initialDay)
          });
        }}
      />
      <Text>{JSON.stringify(selectedDay, null, 2)}</Text>
      <Text>{JSON.stringify(previousSelectedDay, null, 2)}</Text>
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
