import { StyleSheet, Text, View, Dimensions, Button } from 'react-native'
import React, { useEffect } from 'react'
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

import Calendar from "@/components/Calendar";

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MAX_TRANSLATE_Y = (-SCREEN_HEIGHT / 2) + 50

type TopSheetProps = {
  bottomSheetTranslationY: SharedValue<number>
}

export default function TopSheet({ bottomSheetTranslationY }: TopSheetProps) {
  const rTopSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateY: interpolate(
          bottomSheetTranslationY.value,
          [0, MAX_TRANSLATE_Y],
          [0, -190]
        )
      }],
    }
  })

  return (
    <Animated.View style={[styles.topSheetContainer, rTopSheetStyle]} >
      <Calendar />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  topSheetContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'powderblue',
    position: 'absolute',
    top: 0,
  },
  text: {
    alignSelf: 'flex-end',
    color: 'black',
  }
})