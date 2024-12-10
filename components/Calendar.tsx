import { StyleSheet, Text, View, Pressable, Button } from 'react-native'
import React, { useState } from 'react'
import * as dateFns from 'date-fns'

import Day from './Day'

function getWeeks(selectedDay: Date, setSelectedDay: (date: Date) => void) {
  const numDaysInMonth = dateFns.getDaysInMonth(selectedDay)
  let firstDay = dateFns.startOfMonth(selectedDay)
  let dates = []
  let currentDay = firstDay
  for (let i = 0; i < numDaysInMonth; i++) {
    dates.push(currentDay)
    currentDay = dateFns.addDays(currentDay, 1)
  }
  dates = padDatesArray(dates)
  let daysArray = createDays(dates, selectedDay, setSelectedDay)
  let weeks = createWeeks(daysArray)
  return weeks
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

function createDays(dates: Date[], selectedDay: Date, setSelectedDay: (date: Date) => void) {
  let days: JSX.Element[] = []
  dates.map((date) => {
    days.push(<Day key={date.toDateString()} date={date} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />)
  })
  return days
}

function padDatesArray(dates: Date[]) {
  // If Day of week is 2 (Tueday) add the last two days from previous month, if day of week is 3 (wed) add last three days from previous month

  // Get day of week of first day

  let firstDay = dates[0]
  let dayOfFirstDay = dateFns.getDay(dates[0])
  let i = dayOfFirstDay
  let currentDay = firstDay
  while (i > 0) {
    currentDay = dateFns.subDays(currentDay, 1)
    dates.unshift(currentDay)
    i--
  }
  // console.log(dates)
  let lastDay = dates[dates.length - 1]
  while (dates.length < 42) {
    lastDay = dateFns.addDays(lastDay, 1)
    dates.push(lastDay)
  }
  return dates
}

export default function Calendar() {
  let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // let [currentMonth, setCurrentMonth] = useState(null)
  // let [currentDay, setCurrentDay]
  let [selectedDay, setSelectedDay] = useState(new Date())
  let weeks = getWeeks(selectedDay, setSelectedDay)

  const prevMonth = () => {
    let firstDayOfMonth = dateFns.startOfMonth(selectedDay)
    let lastDayOfPrevMonth = dateFns.addDays(firstDayOfMonth, -1)
    let firstDayOfPrevMonth = dateFns.startOfMonth(lastDayOfPrevMonth)
    setSelectedDay(firstDayOfPrevMonth)
  }

  const nextMonth = () => {
    let lastDayOfMonth = dateFns.lastDayOfMonth(selectedDay)
    let firstDayOfNextMonth = dateFns.addDays(lastDayOfMonth, 1)
    setSelectedDay(firstDayOfNextMonth)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.month}>{selectedDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        <Button onPress={nextMonth} title="Next"></Button>
        <Button onPress={prevMonth} title="Previ"></Button>
        <View style={styles.weekdayNames}>
          {daysOfWeek.map((day) => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>
      </View>
      <View style={styles.weeks}>
        {weeks.map((week, index) => (
          <View key={index} style={styles.week}>
            {week}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    width: '100%'
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
    width: 50,
    flexGrow: 1
  },
  week: {
    flexDirection: 'row',
  },
  header: {},
  weeks: {},
})