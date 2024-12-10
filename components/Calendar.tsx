import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import * as dateFns from 'date-fns'

import Day from './Day'

function getWeeks() {
  const numDaysInMonth = dateFns.getDaysInMonth(new Date())
  let firstDay = dateFns.startOfMonth(new Date())
  let dates = []
  let currentDay = firstDay
  for (let i = 0; i < numDaysInMonth; i++) {
    dates.push(currentDay)
    currentDay = dateFns.addDays(currentDay, 1)
  }
  dates = padDatesArray(dates)
  let daysArray = createDays(dates)

  let weeks = createWeeks(daysArray)
  console.log(weeks)
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

function createDays(dates: Date[]) {
  let days: JSX.Element[] = []
  dates.map((date) => {
    days.push(<Day key={date.toDateString()} date={date} />)
  })
  return days
}

function padDatesArray(dates: Date[]) {
  // If Day of week is 2 (Tueday) add the last two days from previous month, if day of week is 3 (wed) add last three days from previous month

  // Get day of week of first day

  // let firstDay = dates[0]
  // let dayOfFirstDay = dateFns.getDay(dates[0])
  // let i = dayOfFirstDay
  // let currentDay = firstDay
  // while (i > 0) {
  //   currentDay = dateFns.subDays(currentDay, 1)
  //   dates.unshift(currentDay)
  //   i--
  // }
  // console.log(dates)
  let lastDay = dates[dates.length - 1]
  while (dates.length < 42) {
    lastDay = dateFns.addDays(lastDay, 1)
    dates.push(lastDay)
  }
  return dates
}

getWeeks()

export default function Calendar() {
  let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let [currentMonth, setCurrentMonth] = useState(null)
  let weeks = getWeeks()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.month}>December 2024</Text>
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