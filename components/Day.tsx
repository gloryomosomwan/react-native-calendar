import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native'
import React from 'react'
import { isSameMonth, isSameDay } from 'date-fns'

type DayProps = {
  date: Date;
  selectedDay: Date;
  setSelectedDay: (date: Date) => void
  setPreviousSelectedDay: (date: Date) => void
  visibleDate: Date
  handleScroll: (date: Date) => void
}

export default function Day({ date, selectedDay, setSelectedDay, setPreviousSelectedDay, visibleDate, handleScroll }: DayProps) {
  const onPress = () => {
    handleScroll(date)
  }

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        {isSameDay(date, selectedDay) && isSameMonth(date, visibleDate) && <View style={styles.selectedDayCircle} />}
        <Text style={[styles.text, !isSameMonth(date, selectedDay) && styles.notInCurrentMonth]}>{date.getDate()}</Text>
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