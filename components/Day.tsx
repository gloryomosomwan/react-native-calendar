import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import * as dateFns from 'date-fns'

type DayProps = {
  date: Date;
  selectedDay: Date;
  setSelectedDay: (date: Date) => void
}

export default function Day({ date, selectedDay, setSelectedDay }: DayProps) {
  const onPress = () => {
    setSelectedDay(date)
  }

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        {dateFns.isSameDay(date, selectedDay) && <View style={styles.selectedDayCircle} />}
        <Text style={[dateFns.isSameMonth(date, selectedDay) ? styles.activeText : styles.inactiveText, dateFns.isSameDay(date, selectedDay) && styles.selectedDay]}>{date.getDate()}</Text>
      </View>
    </Pressable>
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
  selectedDay: {},
  activeText: {
    textAlign: 'center',
    fontWeight: '400',
    width: 20,
  },
  inactiveText: {
    textAlign: 'center',
    fontWeight: '400',
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