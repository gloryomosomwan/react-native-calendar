import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native'
import React from 'react'
import { isSameMonth, isSameDay } from 'date-fns'

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
        {isSameDay(date, selectedDay) && <View style={styles.selectedDayCircle} />}
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