import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from "expo-status-bar";
import { useRef, useCallback } from "react";

// import Calendar from "@/components/Calendar";
import BottomSheet, { BottomSheetRefProps } from "@/components/BottomSheet";

export default function Index() {
  const ref = useRef<BottomSheetRefProps>(null)
  const onPress = useCallback(() => {
    ref?.current?.scrollTo(-100)
  }, [])

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <StatusBar style="light" />
        {/* <TouchableOpacity style={styles.button} /> */}
        <View style={styles.page} />
        <BottomSheet ref={ref} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#111'
  },
  page: {
    backgroundColor: 'grey',
    flex: 1,
    width: '100%'
    // height: 
  },
  button: {
    height: 50,
    borderRadius: 25,
    aspectRatio: 1,
    backgroundColor: 'white',
    opacity: 0.6,
  },
});
