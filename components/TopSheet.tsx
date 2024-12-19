import { StyleSheet, Text, View, Dimensions, Button } from 'react-native'
import React, { useEffect } from 'react'
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
// const MAX_TRANSLATE_Y = (-SCREEN_HEIGHT / 2) + 100

type TopSheetProps = {
  bottomSheetTranslationY: SharedValue<number>
}

export default function TopSheet({ bottomSheetTranslationY }: TopSheetProps) {
  // const translateY = useSharedValue(0)

  const rTopSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: 1 * bottomSheetTranslationY.value }],
    }
  })

  return (
    <Animated.View style={[styles.topSheetContainer, rTopSheetStyle]} >
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  topSheetContainer: {
    height: SCREEN_HEIGHT / 2,
    flex: 1,
    width: '100%',
    backgroundColor: 'powderblue',
    position: 'absolute',
    bottom: SCREEN_HEIGHT / 2,
  },
  text: {
    alignSelf: 'flex-end',
    color: 'black',
  }
})