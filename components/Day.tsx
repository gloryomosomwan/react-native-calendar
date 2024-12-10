import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import * as dateFns from 'date-fns'

type DayProps = {
  date: Date;
}

export default function Day({ date }: DayProps) {

  return (
    <View style={styles.container}>
      <Text style={[dateFns.isSameMonth(date, new Date()) ? styles.activeText : styles.inactiveText, dateFns.isSameDay(date, new Date()) && styles.selectedDay]}>{date.getDate()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: 54,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: 'powderblue',
    borderRadius: 50,
    padding: 10
  },
  activeText: {
    textAlign: 'center',
    fontWeight: '700',
  },
  inactiveText: {
    textAlign: 'center',
    fontWeight: '700',
    color: 'grey'
  }
})