import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native'
import React, { useRef, useLayoutEffect } from 'react'
import { isSameMonth, isSameDay, getWeekOfMonth } from 'date-fns'
import { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DayProps = {
  date: Date;
  selectedDay: Date;
  firstDayOfMonth: Date;
  handlePress: (date: Date) => void
  selectedDayPosition: SharedValue<number>
  bottomSheetTranslationY: SharedValue<number>
  dateOfDisplayedMonth: Date
}

export default function Day({ date, selectedDay, firstDayOfMonth, handlePress, selectedDayPosition, bottomSheetTranslationY, dateOfDisplayedMonth }: DayProps) {
  const elementRef = useRef<View | null>(null)
  const insets = useSafeAreaInsets()

  const onPress = () => {
    if (bottomSheetTranslationY.value === 0 || bottomSheetTranslationY.value === -235) {
      if (elementRef.current) {
        elementRef.current.measure((x, y, width, height, pageX, pageY) => {
          if (bottomSheetTranslationY.value > -235) {
            selectedDayPosition.value = pageY
          }
        });
      }
      handlePress(date)
    }
  }

  useLayoutEffect(() => {
    // Add a check to see where botttom sheet is?
    if (isSameDay(date, selectedDay) && isSameMonth(date, selectedDay) && isSameMonth(firstDayOfMonth, dateOfDisplayedMonth)) {
      //     if (bottomSheetTranslationY.value > -235) {
      //       selectedDayPosition.value = pageY
      //     }
      const weekOfMonth = getWeekOfMonth(date)
      selectedDayPosition.value = (insets.top + 50) + (47 * (weekOfMonth - 1))
    }
  })

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container} ref={elementRef}>
        {isSameDay(date, selectedDay) && isSameMonth(date, firstDayOfMonth) && <View style={styles.selectedDayCircle} />}
        <Text style={[styles.text, !isSameMonth(date, firstDayOfMonth) && styles.notInCurrentMonth]}>{date.getDate()}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 47,
    width: Dimensions.get('window').width / 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '400',
  },
  notInCurrentMonth: {
    color: 'grey',
  },
  selectedDayCircle: {
    position: 'absolute',
    backgroundColor: 'powderblue',
    zIndex: -1,
    width: 34,
    height: 34,
    borderRadius: 100
  },
})