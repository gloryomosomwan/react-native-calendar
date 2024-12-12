import { useState } from "react";
import { View, StyleSheet, FlatList, Dimensions, Button, Text } from "react-native";
import Calendar from "@/components/Calendar";
import { addMonths, subMonths } from "date-fns";

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random()}`
}

export default function Index() {
  const [data, setData] = useState([
    { id: '0', selectedDay: subMonths(new Date(), 1) },
    { id: '1', selectedDay: new Date() },
    { id: '2', selectedDay: addMonths(new Date(), 1) },
  ])

  const fetchPrevious = () => {
    const newDay = subMonths(data[0].selectedDay, 1);
    setData(prevData => {
      const newData = [...prevData];
      newData.unshift({ id: generateUniqueId(), selectedDay: newDay });
      newData.pop();
      return newData;
    });
  }

  const fetchNext = () => {
    const newDay = addMonths(data[data.length - 1].selectedDay, 1)
    setData(prevData => {
      const newData = [...prevData];
      newData.push({ id: generateUniqueId(), selectedDay: newDay });
      newData.shift();
      return newData;
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => <Calendar initialDay={item.selectedDay} />}
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
      />
      <Text>{JSON.stringify(data, null, 2)}</Text>
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
