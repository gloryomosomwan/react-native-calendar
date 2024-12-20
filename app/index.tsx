import { View, StyleSheet, Text, TouchableOpacity, Button, SafeAreaView } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from "expo-status-bar";
import { useRef, useCallback, useEffect } from "react";
import { useSharedValue } from "react-native-reanimated";

import Calendar from "@/components/Calendar";
import BottomSheet from "@/components/BottomSheet";
import TopSheet from "@/components/TopSheet";

export default function Index() {
  const bottomSheetTranslationY = useSharedValue(0)

  useEffect(() => {
    console.log('render')
  })

  return (
    <GestureHandlerRootView>
      <View style={styles.header}></View>
      <View style={styles.container}>
        <TopSheet bottomSheetTranslationY={bottomSheetTranslationY} />
        <BottomSheet translateY={bottomSheetTranslationY} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white'
  },
  header: {
    position: 'absolute',
    zIndex: 1,
    height: 20,
    top: 0,
    width: '100%',
    backgroundColor: 'grey',
  }
});
