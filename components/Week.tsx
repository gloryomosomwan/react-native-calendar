import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { addDays, startOfWeek } from 'date-fns'
import { SharedValue } from 'react-native-reanimated'

import Day from './Day'

type WeekProps = {
  initialDay: Date
  selectedDay: Date
  handlePress: (date: Date) => void
  selectedDayPosition: SharedValue<number>
  setCalendarBottom: (y: number) => void
  bottomSheetTranslationY: SharedValue<number>
  dateOfDisplayedMonth: Date
}

export default function Week({ initialDay, selectedDay, handlePress, selectedDayPosition, setCalendarBottom, bottomSheetTranslationY, dateOfDisplayedMonth }: WeekProps) {
  let dates = []
  let firstDayOfWeek = startOfWeek(initialDay)
  let currentDay = firstDayOfWeek
  for (let i = 0; i < 7; i++) {
    dates.push(currentDay)
    currentDay = addDays(currentDay, 1)
  }

  let days: JSX.Element[] = []
  dates.map((date) => {
    days.push(<Day key={date.toDateString()} date={date} selectedDay={selectedDay} firstDayOfMonth={initialDay} handlePress={handlePress} selectedDayPosition={selectedDayPosition} bottomSheetTranslationY={bottomSheetTranslationY} dateOfDisplayedMonth={dateOfDisplayedMonth} />)
  })

  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>WeekView</Text> */}
      <View style={styles.days}>
        {days}
      </View>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 97,
    width: '100%',
  },
  days: {
    flexDirection: 'row'
  },
  // text: {
  //   fontSize: 40,
  //   paddingTop: 100
  // }
})