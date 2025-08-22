import React, { useCallback } from 'react';
import { View, ViewProps, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { StyleSheet, UnistylesVariants, useUnistyles } from 'react-native-unistyles';
import { Icon } from './icon';
import { Text } from './typography';

/**
 * Props for the SwipeButton component
 */
interface SwipeButtonProps extends ViewProps {
  /** Callback function to execute when swipe is completed */
  onSwipeComplete: () => void;
  /** Text to display in the button */
  text?: string;
  /** Icon name to display in the swipeable button */
  iconName?: React.ComponentProps<typeof Icon>['name'];
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
 *   iconName="trash"
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
  iconName = 'arrow-right',
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
  const containerWidth = 280; // Default container width
  const maxTranslateX = containerWidth - buttonSize - 8; // Account for margins

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
    .onUpdate((event) => {
      // Only allow rightward movement
      const newTranslateX = Math.max(0, Math.min(event.translationX, maxTranslateX));
      translateX.value = newTranslateX;
    })
    .onEnd((event) => {
      const progress = translateX.value / maxTranslateX;
      const velocity = event.velocityX;

      // Check if swipe is complete (threshold: 80% or high velocity)
      if (progress > 0.8 || (progress > 0.5 && velocity > 500)) {
        // Complete the swipe
        translateX.value = withTiming(maxTranslateX, { duration: 200 });
        isCompleted.value = true;
        handleSwipeComplete();
      } else {
        // Reset to start
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    })
    .runOnJS(true);

  // Animated styles for the sliding button
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
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

  // Animated styles for the icon
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const progress = translateX.value / maxTranslateX;
    const scale = interpolate(progress, [0.7, 1], [1, 1.2], 'clamp');

    return {
      transform: [{ scale }],
    };
  });

  // Use stylesheet variants for styling
  styles.useVariants({
    variant,
    disabled: disabled || isLoading,
  });

  return (
    <View style={[styles.wrapper, style]} {...props}>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {/* Text */}
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          {!isLoading ? (
            <>
              <Text size="base" weight="medium" style={styles.text}>
                {text}
              </Text>
              <Icon name="arrow-right" size={16} color="muted" />
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
            ]}>
            <Animated.View style={iconAnimatedStyle}>
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Icon name={iconName} size={20} color="white" />
              )}
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        {/* Track indicator */}
        <View style={[styles.track, { width: maxTranslateX }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: 280,
    height: 60,
  },
  container: {
    width: '100%',
    height: '100%',
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

  track: {
    position: 'absolute',
    left: 4,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
}));
