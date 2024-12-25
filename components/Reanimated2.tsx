import React, { useRef } from "react";
import {
  Animated,
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";

const { height } = Dimensions.get("window");

export default function Reanimated2() {
  const animationValue = useSharedValue(0)

  return (
    <View style={styles.container}>
      {/* Top Sheet */}
      <View style={styles.topSheet}>
        <Animated.View
          style={[
            styles.topSheetElement,
            { transform: [{ translateY: topSheetElementAnimatedY }] },
          ]}
        />
      </View>

      {/* Bottom Sheet */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: bottomSheetAnimatedY }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  topSheet: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff9e80",
  },
  topSheetElement: {
    width: 100,
    height: 100,
    backgroundColor: "#ff3d00",
    borderRadius: 50,
  },
  bottomSheet: {
    position: "absolute",
    width: "100%",
    height: height / 2,
    backgroundColor: "#80d8ff",
    bottom: 0,
  },
});
