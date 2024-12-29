import { View, StyleSheet, Platform, StatusBar, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function TopSheet() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }
    ]}
    >
      <Text style={{ fontSize: 25 }}>This is top text.</Text>
      <View
        style={{ flex: 1 }}
        onLayout={({ nativeEvent }) => {
          console.log(nativeEvent.layout.y)
        }}>
        <Text>Inside the view...</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'powderblue',
  },
})