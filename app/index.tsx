import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSharedValue } from "react-native-reanimated";

import Calendar from "@/components/Calendar";
import BottomSheet from "@/components/BottomSheet";

export default function Index() {
  const animationValue = useSharedValue(0)
  const calendarBottom = useSharedValue(0)

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <Calendar bottomSheetTranslationY={animationValue} calendarBottom={calendarBottom} />
        <BottomSheet translateY={animationValue} calendarBottom={calendarBottom} />
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