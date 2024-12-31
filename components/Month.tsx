import { StyleSheet, Text, View, SafeAreaView, Dimensions, Button } from 'react-native'
import React, { forwardRef, useEffect } from 'react'
import { startOfMonth, addDays, subDays, getDay, getDaysInMonth } from 'date-fns'
import { SharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Day from './Day'

type MonthProps = {
  initialDay: Date
  selectedDay: Date
  handlePress: (date: Date) => void
  selectedDayPosition: SharedValue<number>
  setCalendarBottom: (y: number) => void
}

// Use forwardRef to allow the parent component to pass a ref to this component
const Month = forwardRef<View, MonthProps>(({ initialDay, selectedDay, handlePress, selectedDayPosition, setCalendarBottom }: MonthProps, ref) => {
  const dates = getDates(initialDay)
  const paddedDates = padDatesArray(dates)
  const daysArray = createDays(paddedDates, selectedDay, initialDay, handlePress, selectedDayPosition)
  const weeks = createWeeks(daysArray)

  const insets = useSafeAreaInsets()

  return (
    <View ref={ref} style={styles.container}
      onLayout={(e) => {
        let bottom = e.nativeEvent.layout.height + insets.top
        console.log(bottom)
        setCalendarBottom(bottom)
      }}
    >
      <View style={styles.weeks}>
        {weeks.map((week, index) => (
          <View key={index} style={styles.week}>
            {week}
          </View>
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 50,
  },
  week: {
    flexDirection: 'row',
  },
  weeks: {},
})

function createDays(dates: Date[], selectedDay: Date, initialDay: Date, handlePress: (date: Date) => void, selectedDayPosition: SharedValue<number>) {
  let days: JSX.Element[] = []
  dates.map((date) => {
    days.push(<Day key={date.toDateString()} date={date} selectedDay={selectedDay} firstDayOfMonth={initialDay} handlePress={handlePress} selectedDayPosition={selectedDayPosition} />)
  })
  return days
}

function getDates(initialDay: Date) {
  const numDaysInMonth = getDaysInMonth(initialDay)
  let firstDay = startOfMonth(initialDay)
  let dates = []
  let currentDay = firstDay
  for (let i = 0; i < numDaysInMonth; i++) {
    dates.push(currentDay)
    currentDay = addDays(currentDay, 1)
  }
  return dates
}

function padDatesArray(dates: Date[]) {
  let firstDay = dates[0]
  let dayOfFirstDay = getDay(dates[0])
  let i = dayOfFirstDay
  let currentDay = firstDay
  while (i > 0) {
    currentDay = subDays(currentDay, 1)
    dates.unshift(currentDay)
    i--
  }
  let lastDay = dates[dates.length - 1]
  while (dates.length < 42) {
    lastDay = addDays(lastDay, 1)
    dates.push(lastDay)
  }
  return dates
}

function createWeeks(daysArray: React.ReactNode[]) {
  let weeks = []
  for (let i = 0; i < 6; i++) {
    let week = []
    for (let j = 0; j < 7; j++) {
      let day = daysArray.shift()
      week.push(day)
    }
    weeks.push(week)
  }
  return weeks
}

export default Month