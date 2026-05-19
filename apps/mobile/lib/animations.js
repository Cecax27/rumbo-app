import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";

/**
 * Fade + slide-up entrance animation.
 * @param {number} delay - delay in ms before animation starts
 * @param {number} offsetY - starting Y offset (pixels, positive = below)
 */
export function useFadeSlideIn(delay = 0, offsetY = 30) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(offsetY);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 18, stiffness: 120 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}

/**
 * Simple fade-in entrance animation.
 * @param {number} delay - delay in ms before animation starts
 */
export function useFadeIn(delay = 0) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}

/**
 * Scale + fade entrance animation (good for icons/logos).
 * @param {number} delay - delay in ms before animation starts
 */
export function useScaleFadeIn(delay = 0) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    scale.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 130 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
}
