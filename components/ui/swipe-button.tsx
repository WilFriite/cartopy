import React, { useCallback, useState } from 'react';
import { ViewProps, ActivityIndicator, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from './typography';
import { Icon } from './icon';
import { ArrowRight } from 'lucide-react-native';

/**
 * Props for the SwipeButton component
 */
interface SwipeButtonProps extends ViewProps {
  /** Callback function to execute when swipe is completed */
  onSwipeComplete: () => Promise<void>;
  /** Text to display in the button */
  text?: string;
  /** Icon to display in the swipeable button */
  icon?: React.ComponentProps<typeof Icon>['as'];
  /** Button variant for different styles */
  variant?: 'normal' | 'destructive';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state - disables the button and shows activity indicator */
  isLoading?: boolean;
}

/**
 * SwipeButton Component - A button that requires swiping to the right to execute an action
 *
 * @example
 * ```tsx
 * <SwipeButton
 *   text="Swipe to delete"
 *   icon={Trash}
 *   variant="destructive"
 *   onSwipeComplete={() => console.log('Action executed!')}
 * />
 *
 * // With loading state
 * <SwipeButton
 *   text="Processing..."
 *   isLoading={true}
 *   onSwipeComplete={() => console.log('Action executed!')}
 * />
 * ```
 */
export const SwipeButton: React.FC<SwipeButtonProps> = ({
  onSwipeComplete,
  text = 'Swipe to confirm',
  icon = ArrowRight,
  variant = 'normal',
  disabled = false,
  isLoading = false,
  style,
  ...props
}) => {
  const { theme } = useUnistyles();

  // Animation values
  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);

  // Calculate dimensions
  const buttonSize = 52; // Fixed button size
  const [containerWidth, setContainerWidth] = useState(0); // Default container width
  const maxTranslateX = Math.abs(Math.floor(containerWidth * 0.7) - buttonSize - 8); // Account for margins

  const handleSwipeComplete = useCallback(() => {
    if (!disabled && !isLoading) {
      onSwipeComplete();
      // Reset after a short delay
      setTimeout(() => {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        isCompleted.value = false;
      }, 300);
    }
  }, [onSwipeComplete, disabled, isLoading, translateX, isCompleted]);

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .enabled(!disabled && !isLoading)
    .minDistance(5) // Add minimum distance to prevent accidental triggers
    .minPointers(1)
    .maxPointers(1)
    .onBegin(() => {
      console.log('SwipeButton: Gesture began');
    })
    .onUpdate((event) => {
      // Only allow rightward movement
      const newTranslateX = Math.max(0, Math.min(event.translationX, maxTranslateX));
      translateX.value = newTranslateX;
      console.log('SwipeButton: Gesture update', {
        translationX: event.translationX,
        newTranslateX,
      });
    })
    .onEnd((event) => {
      const progress = translateX.value / maxTranslateX;
      const velocity = event.velocityX;
      console.log('SwipeButton: Gesture end', { progress, velocity, maxTranslateX });

      // Check if swipe is complete (threshold: 80% or high velocity)
      if (progress > 0.8 || (progress > 0.5 && velocity > 500)) {
        console.log('SwipeButton: Completing swipe');
        // Complete the swipe
        translateX.value = withTiming(maxTranslateX, { duration: 10 });
        isCompleted.value = true;
        handleSwipeComplete();
      } else {
        console.log('SwipeButton: Resetting swipe');
        // Reset to start
        translateX.value = withSpring(0, { damping: 50, stiffness: 150 });
      }
    })
    .runOnJS(true)
    .activateAfterLongPress(0); // Remove any long press delay

  // Animated styles for the sliding button
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const progress = translateX.value / maxTranslateX;

    const borderColor = interpolateColor(
      progress,
      [0, 0.5, 1],
      [
        theme.colors.astral,
        variant === 'destructive' ? theme.colors.crimson + '20' : theme.colors.outline + '20',
        variant === 'destructive' ? theme.colors.crimson : theme.colors.outline,
      ]
    );

    return {
      transform: [{ translateX: translateX.value }],
      borderColor,
    };
  });

  // Animated styles for the container background
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const progress = translateX.value / maxTranslateX;

    const backgroundColor = interpolateColor(
      progress,
      [0, 0.5, 1],
      [
        theme.colors.surface,
        variant === 'destructive' ? theme.colors.crimson + '20' : theme.colors.astral + '20',
        variant === 'destructive' ? theme.colors.crimson : theme.colors.astral,
      ]
    );

    return {
      backgroundColor,
    };
  });

  // Animated styles for the text
  const textAnimatedStyle = useAnimatedStyle(() => {
    const progress = translateX.value / maxTranslateX;
    const opacity = interpolate(progress, [0, 0.3, 0.7], [1, 0.7, 0]);

    return {
      opacity,
    };
  });

  // Use stylesheet variants for styling
  styles.useVariants({
    variant,
    disabled: disabled || isLoading,
  });

  return (
    <Animated.View
      style={[styles.container, containerAnimatedStyle, style]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
      {...props}>
      {/* Text */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        {!isLoading ? (
          <>
            <Text size="base" weight="medium" style={styles.text}>
              {text}
            </Text>
            <Icon as={ArrowRight} size={24} color="muted" />
          </>
        ) : (
          <Text size="base" weight="medium" style={styles.text}>
            Chargement en cours…
          </Text>
        )}
      </Animated.View>

      {/* Sliding Button */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
            },
            buttonAnimatedStyle,
          ]}
          // Android-specific touch optimizations
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Swipe button">
          <View>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Icon as={icon} size={20} color="white" />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    height: 60,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    variants: {
      variant: {
        normal: {
          borderColor: theme.colors.astral,
        },
        destructive: {
          borderColor: theme.colors.crimson,
        },
      },
      disabled: {
        true: {
          borderColor: theme.colors.outline,
        },
        false: {},
      },
    },
  },
  textContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    variants: {
      variant: {
        normal: {
          color: theme.colors.typography,
        },
        destructive: {
          color: theme.colors.typography,
        },
      },
      disabled: {
        true: {
          color: theme.colors.muted,
        },
        false: {},
      },
    },
  },
  button: {
    position: 'absolute',
    left: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: theme.shadows.hard[2],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android-specific optimizations for better touch handling
    minHeight: 44, // Minimum touch target size for Android
    minWidth: 44,
    variants: {
      variant: {
        normal: {
          backgroundColor: theme.colors.astral,
        },
        destructive: {
          backgroundColor: theme.colors.crimson,
        },
      },
      disabled: {
        true: {
          backgroundColor: theme.colors.muted,
        },
        false: {},
      },
    },
  },
}));
