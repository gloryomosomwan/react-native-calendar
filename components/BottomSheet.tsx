import { StyleSheet, Text, View, Dimensions, Button } from 'react-native'
import React, { useCallback, useEffect, useImperativeHandle } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MAX_TRANSLATE_Y = (-SCREEN_HEIGHT / 2) + 50

type BottomSheetProps = {
  translateY: SharedValue<number>
}

export default function BottomSheet({ translateY }: BottomSheetProps) {
  const scrollTo = useCallback((destination: number) => {
    'worklet'
    translateY.value = withSpring(destination, { damping: 50 })
  }, [])

  const context = useSharedValue({ y: 0 })

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value }
    })
    .onUpdate((event) => {
      console.log(event.translationY)
      translateY.value = event.translationY + context.value.y
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y)
      translateY.value = Math.min(translateY.value, 0)
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 4) {
        scrollTo(0)
      }
      else if (translateY.value < -SCREEN_HEIGHT / 4) {
        scrollTo(MAX_TRANSLATE_Y)
      }
    })

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(translateY.value, [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y], [25, 5], Extrapolate.CLAMP)

    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    }
  })

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]} >
        <View style={styles.line} />
        <Button title='press me' onPress={() => console.log(translateY.value)}></Button>
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'powderblue',
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 + 20,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  }
})