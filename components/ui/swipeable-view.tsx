import { useSegments } from 'expo-router';
import React, { useEffect, type PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Supported swipe directions
 */
type SwipeDirection = 'left' | 'right';

/**
 * Props for the Swipeable component
 */
interface SwipeableListItemProps extends ViewProps {
  /** Content to reveal when swiping (e.g. action buttons) */
  hiddenPan: React.ReactNode;
  /** Maximum swipe distance in pixels (default: 150) */
  threshold?: number;
  /** Swipe direction (default: 'right') */
  direction?: SwipeDirection;
}

/**
 * Swipeable Component - Reveals hidden content when swiping in the specified direction
 *
 * @example
 * ```tsx
 * // Swipe right (default)
 * <Swipeable
 *   hiddenPan={<DeleteButton />}
 * >
 *   <Text>Swipe right</Text>
 * </Swipeable>
 *
 * // Swipe left
 * <Swipeable
 *   direction="left"
 *   hiddenPan={<ArchiveButton />}
 * >
 *   <Text>Swipe left</Text>
 * </Swipeable>
 * ```
 *
 * @param children - Main content to display
 * @param hiddenPan - Hidden content revealed by swiping
 * @param className - Additional CSS classes
 * @param threshold - Maximum swipe distance (default: 150px)
 * @param direction - Swipe direction: 'left' | 'right' (default: 'right')
 *
 * @requires react-native-gesture-handler
 * @requires react-native-reanimated
 */
export const SwipeableView = ({
  hiddenPan,
  children,
  style,
  threshold = 150,
  direction = 'right',
}: PropsWithChildren<SwipeableListItemProps>) => {
  const segments = useSegments();
  const translateX = useSharedValue(0);

  const directionMultiplier = direction === 'right' ? 1 : -1;

  const resetGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(1)
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 50, stiffness: 400 });
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const targetTranslation = event.translationX * directionMultiplier;

      // Limit the translation to the threshold, always in the direction of the swipe
      if (targetTranslation > 0) {
        translateX.value = Math.min(targetTranslation, threshold) * directionMultiplier;
      }
    })
    .onEnd((event) => {
      const targetTranslation = event.translationX * directionMultiplier;

      if (targetTranslation > threshold / 2) {
        translateX.value = withTiming(threshold * directionMultiplier, {
          duration: 200,
        });
      } else {
        // Sinon, revenir à la position initiale
        translateX.value = withTiming(0, {
          duration: 200,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const hiddenPanAnimatedStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateX.value) / threshold;

    return {
      width: Math.abs(translateX.value) > threshold ? threshold : Math.abs(translateX.value),
      opacity: progress,
    };
  });

  const hiddenPanSideStyle = direction === 'right' ? styles.hiddenPanLeft : styles.hiddenPanRight;

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 200 });
  }, [segments]);

  return (
    <View style={[styles.container, style]}>
      {/* Hidden pan to be revealed when swiping */}
      <Animated.View style={[styles.hiddenPanBase, hiddenPanSideStyle, hiddenPanAnimatedStyle]}>
        {hiddenPan}
      </Animated.View>

      {/* Main content with swipe gesture */}
      <GestureDetector gesture={Gesture.Exclusive(panGesture, resetGesture)}>
        <Animated.View style={[styles.mainContent, animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};
const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'relative',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  hiddenPanBase: {
    position: 'absolute',
    height: '100%',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenPanLeft: {
    left: 0,
  },
  hiddenPanRight: {
    right: 0,
  },
  mainContent: {
    zIndex: 20,
  },
}));
