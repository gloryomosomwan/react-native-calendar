import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { isSameMonth, isSameDay } from 'date-fns'
import { SharedValue } from 'react-native-reanimated';

type DayProps = {
  date: Date;
  selectedDay: Date;
  firstDayOfMonth: Date;
  handlePress: (date: Date) => void
  selectedDayPosition: SharedValue<number>
  topRowPosition: SharedValue<number>
}

export default function Day({ date, selectedDay, firstDayOfMonth, handlePress, selectedDayPosition, topRowPosition }: DayProps) {
  const elementRef = useRef<View | null>(null)
  useEffect(() => {
    if (isSameDay(date, firstDayOfMonth) && isSameDay(date, selectedDay)) {
      console.log(date)
      if (elementRef.current)
        elementRef.current.measure((_, __, ___, ____, _____, pageY) => {
          console.log(pageY)
          topRowPosition.value = pageY
        });
    }
  })

  const onPress = () => {
    if (elementRef.current)
      elementRef.current.measure((_, __, ___, ____, _____, pageY) => {
        selectedDayPosition.value = pageY
      });
    handlePress(date)
  }

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