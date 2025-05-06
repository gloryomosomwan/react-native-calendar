import { StyleSheet, Text, View, Pressable, Dimensions, Platform } from 'react-native'
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react'
import { isSameMonth, isSameDay, getWeekOfMonth, isBefore } from 'date-fns'
import { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCalendar } from "./CalendarContext";

type DayType = 'week' | 'month'

type DayProps = {
  date: Date;
  firstDayOfMonth: Date;
  handlePress: (date: Date) => void
  selectedDatePosition: SharedValue<number>
  bottomSheetTranslationY: SharedValue<number>
  dateOfDisplayedMonth: Date
  dayType: DayType
}

export default function Day({ date, firstDayOfMonth, handlePress, selectedDatePosition, bottomSheetTranslationY, dateOfDisplayedMonth, dayType }: DayProps) {
  const { calendarState } = useCalendar()
  const [selectedDate, setSelectedDate] = useState(calendarState.currentDate)

  const elementRef = useRef<View | null>(null)
  const insets = useSafeAreaInsets()

  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }

  useEffect(() => {
    const unsubscribe = calendarState.subscribe(() => {
      setSelectedDate(calendarState.currentDate)
    });
    return unsubscribe;
  }, [])


  const onPress = () => {
    console.log('pressed')
    // if (bottomSheetTranslationY.value === 0 || bottomSheetTranslationY.value === -235) {
    //   if (elementRef.current) {
    //     elementRef.current.measure((x, y, width, height, pageX, pageY) => {
    //       // if (bottomSheetTranslationY.value > -235) {
    //       selectedDatePosition.value = pageY
    //       // }
    //     });
    //   }
    //   handlePress(date)
    // }
    handlePress(date)
  }

  useLayoutEffect(() => {
    // Add a check to see where botttom sheet is?
    if (isSameDay(date, selectedDate) && isSameMonth(date, selectedDate) && isSameMonth(firstDayOfMonth, dateOfDisplayedMonth)) {
      //     if (bottomSheetTranslationY.value > -235) {
      //       selectedDatePosition.value = pageY
      //     }
      const weekOfMonth = getWeekOfMonth(date)
      selectedDatePosition.value = (topPadding + 50) + (47 * (weekOfMonth - 1))
    }
  })

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container} ref={elementRef}>
        {
          dayType === 'month' ? (
            <>
              {isSameDay(date, selectedDate) && isSameMonth(date, firstDayOfMonth) && <View style={styles.selectedDateCircle} />}
              <Text style={[styles.text, !isSameMonth(date, firstDayOfMonth) && styles.notInCurrentMonth]}>{date.getDate()}</Text>
            </>
          ) : (
            <>
              {isSameDay(date, selectedDate) && <View style={styles.selectedDateCircle} />}
              <Text style={[styles.text, !isSameMonth(date, selectedDate) && styles.notInCurrentMonth]}>{date.getDate()}</Text>
            </>
          )
        }
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
  selectedDateCircle: {
    position: 'absolute',
    backgroundColor: 'powderblue',
    zIndex: -1,
    width: 34,
    height: 34,
    borderRadius: 100
  },
})