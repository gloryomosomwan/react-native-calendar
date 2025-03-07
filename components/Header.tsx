import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type HeaderProps = {
  selectedDate: Date
}

export default function Header({ selectedDate }: HeaderProps) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const insets = useSafeAreaInsets()
  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }

  return (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      <Text style={styles.monthName}>{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
      <View style={styles.weekdayNames}>
        {daysOfWeek.map((day) => (
          <Text key={day} style={styles.dayName}>{day}</Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1,
  },
  monthName: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 5
  },
  weekdayNames: {
    flexDirection: 'row',
  },
  dayName: {
    textAlign: 'center',
    width: Dimensions.get('window').width / 7,
  },
})