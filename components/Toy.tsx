import { StyleSheet, Text, Dimensions, View } from 'react-native'
import React, { useEffect } from 'react'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type ToyProps = {
  date: Date
}

export default function Toy({ date }: ToyProps) {

  useEffect(() => {
    console.log('render', date)
  })

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{date.toLocaleDateString()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 30,
    color: 'blue',
  }
})