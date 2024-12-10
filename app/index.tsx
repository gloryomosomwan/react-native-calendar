import { Text, View, StyleSheet } from "react-native";
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
    height: 0
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
  // Add more styles as needed
});
