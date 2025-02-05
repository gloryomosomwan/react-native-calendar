import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Week() {
  // const dates = getDates

  return (
    <View>
      <Text style={styles.text}>WeekView</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 40,
    paddingTop: 100
  }
})