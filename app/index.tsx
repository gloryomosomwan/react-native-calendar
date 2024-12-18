import { View, StyleSheet, Text } from "react-native";

import Calendar from "@/components/Calendar";

export default function Index() {

  return (
    <View style={styles.container}>
      <Calendar />
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
