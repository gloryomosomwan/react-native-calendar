import { StyleSheet, Text, View, SafeAreaView, Dimensions, Button } from 'react-native'
import React from 'react'
import { startOfMonth, addDays, subDays, getDay, getDaysInMonth } from 'date-fns'
import { SharedValue } from 'react-native-reanimated'

import Day from './Day'

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

function createDays(dates: Date[], selectedDay: Date, initialDay: Date, handlePress: (date: Date) => void, selectedDayPosition: SharedValue<number>) {
  let days: JSX.Element[] = []
  dates.map((date) => {
    days.push(<Day key={date.toDateString()} date={date} selectedDay={selectedDay} firstDayOfMonth={initialDay} handlePress={handlePress} selectedDayPosition={selectedDayPosition} />)
  })
  return days
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

type MonthProps = {
  initialDay: Date
  selectedDay: Date
  handlePress: (date: Date) => void
  selectedDayPosition: SharedValue<number>
}

export default function Month({ initialDay, selectedDay, handlePress, selectedDayPosition }: MonthProps) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const dates = getDates(initialDay)
  const paddedDates = padDatesArray(dates)
  const daysArray = createDays(paddedDates, selectedDay, initialDay, handlePress, selectedDayPosition)
  const weeks = createWeeks(daysArray)

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.month}>{initialDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </View>
        <View style={styles.weekdayNames}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>
        <View style={styles.weeks}>
          {weeks.map((week, index) => (
            <View key={index} style={styles.week}>
              {week}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    width: '100%',
  },
  month: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 5
  },
  weekdayNames: {
    flexDirection: 'row',
    width: '100%'
  },
  dayName: {
    textAlign: 'center',
    width: Dimensions.get('window').width / 7,
  },
  week: {
    flexDirection: 'row',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  weeks: {},
})