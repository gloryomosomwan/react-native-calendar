import { View, StyleSheet, Text, TouchableOpacity, Button, Dimensions, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useRef, useCallback, useEffect } from "react";
import Animated, { useSharedValue, interpolate, useAnimatedStyle } from "react-native-reanimated";

import Calendar from "@/components/Calendar";
import BottomSheet from "@/components/BottomSheet";
import TopSheet from "@/components/TopSheet";

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MAX_TRANSLATE_Y = (-SCREEN_HEIGHT / 2) + 50

export default function Index() {
  const animationValue = useSharedValue(0)

  // useEffect(() => {
  //   console.log(SCREEN_HEIGHT / 2 + 20)
  //   console.log(MAX_TRANSLATE_Y)
  // })

  return (
    <GestureHandlerRootView>
      {/* <View style={styles.header}></View> */}
      <View style={styles.container}>
        {/* <TopSheet bottomSheetTranslationY={animationValue} /> */}
        <Calendar bottomSheetTranslationY={animationValue} />
        <BottomSheet translateY={animationValue} />
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
    height: SCREEN_HEIGHT / 40,
    top: 0,
    width: '100%',
    backgroundColor: 'grey',
  }
});