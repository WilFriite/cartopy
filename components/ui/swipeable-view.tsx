import { useSegments } from 'expo-router';
import React, { useEffect, type PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
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
  const startX = useSharedValue(0);
  const directionMultiplier = direction === 'right' ? 1 : -1;

  const resetGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(1)
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 50, stiffness: 400 });
    });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const raw = startX.value + event.translationX;
      const min = direction === 'right' ? 0 : -threshold;
      const max = direction === 'right' ? threshold : 0;
      // Clamp within allowed range so users can open or close by dragging back
      const travelValue = Math.min(Math.max(raw, min), max);
      translateX.value = withSpring(travelValue, { damping: 50, stiffness: 400 });
    })
    .onEnd((event) => {
      const progress = translateX.value * directionMultiplier;
      const velocity = event.velocityX * directionMultiplier;
      const shouldOpen = progress > threshold / 2 || velocity > 800;
      const target = shouldOpen ? threshold * directionMultiplier : 0;
      translateX.value = withSpring(target, { damping: 50, stiffness: 400 });
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

  const hintBarStyle = useAnimatedStyle(() => {
    const openness = Math.min(Math.abs(translateX.value) / threshold, 1);
    const visibility = 1 - openness; // 1 at rest, 0 when fully swiped
    return {
      opacity: visibility,
      transform: [
        { translateY: '-50%' },
        { scaleY: Math.max(visibility, 0) },
        { translateX: translateX.value },
      ],
    };
  });

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 200 });
  }, [segments]);

  return (
    <View style={[styles.container, style]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Hidden pan to be revealed when swiping */}
        <Animated.View style={[styles.hiddenPanBase, hiddenPanSideStyle, hiddenPanAnimatedStyle]}>
          {hiddenPan}
        </Animated.View>

        {/* Main content with swipe gesture */}
        <Animated.View style={[styles.hintBar(direction), hintBarStyle]} />
        <GestureDetector gesture={Gesture.Exclusive(panGesture, resetGesture)}>
          <Animated.View style={[styles.mainContent(direction), animatedStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
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
  mainContent: (direction: SwipeDirection) => ({
    paddingLeft: direction === 'right' ? theme.spacing.md : 0,
    paddingRight: direction === 'right' ? 0 : theme.spacing.md,
  }),
  hintBar: (direction: SwipeDirection) => ({
    position: 'absolute',
    top: '50%',
    left: direction === 'right' ? '2%' : '98%',
    height: 30,
    width: 3,
    backgroundColor: theme.colors.azureRadiance,
    zIndex: 10,
    borderRadius: theme.borderRadius.full,
    transform: [{ translateY: -15 }],
  }),
}));
