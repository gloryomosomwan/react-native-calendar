import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { addDays, startOfWeek } from 'date-fns'
import { SharedValue } from 'react-native-reanimated'

import Day from './Day'

type WeekProps = {
  initialDay: Date
  handlePress: (date: Date) => void
  // selectedDate: Date
  selectedDatePosition: SharedValue<number>
  bottomSheetTranslationY: SharedValue<number>
  dateOfDisplayedMonth: Date
}

export default function Week({ initialDay, handlePress, bottomSheetTranslationY, selectedDatePosition, dateOfDisplayedMonth }: WeekProps) {
  let dates = []
  let firstDayOfWeek = startOfWeek(initialDay)
  let currentDay = firstDayOfWeek
  for (let i = 0; i < 7; i++) {
    dates.push(currentDay)
    currentDay = addDays(currentDay, 1)
  }

  let days: JSX.Element[] = []
  dates.map((date) => {
    days.push(
      <Day
        key={date.toDateString()}
        date={date}
        // selectedDate={selectedDate}
        firstDayOfMonth={initialDay}
        handlePress={handlePress}
        selectedDatePosition={selectedDatePosition}
        bottomSheetTranslationY={bottomSheetTranslationY}
        dateOfDisplayedMonth={dateOfDisplayedMonth}
        dayType='week'
      />
    )
  })

  return (
    <View style={styles.container}>
      <View style={styles.days}>
        {days}
      </View>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'aliceblue'
  },
  days: {
    flexDirection: 'row'
  },
})