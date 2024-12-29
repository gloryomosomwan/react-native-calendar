import { StyleSheet, Text, FlatList, TouchableHighlight, Dimensions, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { addMonths } from 'date-fns'

import Toy from './Toy'

const initialDate = new Date()
const pastRange = 10
const futureRange = 10

const items: Date[] = []
for (let i = 0; i < pastRange + futureRange; i++) {
  const monthDate = addMonths(initialDate, i - pastRange)
  items.push(monthDate)
}

export default function CalendarV2() {
  return (
    <View>
      <Text>CalendarV2</Text>
      <FlatList
        renderItem={({ item }) => <Toy date={item} />}
        data={items}
        horizontal
        pagingEnabled
        getItemLayout={(data, index) => (
          { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
        )}
        initialScrollIndex={(pastRange + futureRange) / 2}
      />
    </View>
  )
}

const styles = StyleSheet.create({})