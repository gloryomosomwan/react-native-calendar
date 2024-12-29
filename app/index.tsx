import { View, StyleSheet, Text, Button, Dimensions, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useRef, useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

import Calendar from "@/components/Calendar";
import CalendarV2 from "@/components/CalendarV2";
import BottomSheet from "@/components/BottomSheet";
import TopSheet from "@/components/TopSheet";

export default function Index() {
  const animationValue = useSharedValue(0)

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <Calendar bottomSheetTranslationY={animationValue} />
        {/* <TopSheet /> */}
        <BottomSheet translateY={animationValue} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
});