import { View, StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Calendar from "@/components/Calendar";
import BottomSheet from "@/components/BottomSheet";

export default function Index() {
  const animationValue = useSharedValue(0)
  const insets = useSafeAreaInsets()
  let topPadding = 0;
  if (Platform.OS === 'android') {
    topPadding = 0
  }
  else if (Platform.OS === 'ios') {
    topPadding = insets.top
  }
  const calendarBottom = useSharedValue((47 * 6) + topPadding + 52)

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <Calendar bottomSheetTranslationY={animationValue} calendarBottom={calendarBottom} />
        {/* <BottomSheet translateY={animationValue} calendarBottom={calendarBottom} /> */}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
});