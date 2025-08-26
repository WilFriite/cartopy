import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { HStack } from './stack';
import { Text } from './typography';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  duration?: number;
}

export function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  duration = 150,
}: SwitchProps) {
  const { theme } = useUnistyles();

  // Shared values for dimensions and animation
  const height = useSharedValue(0);
  const width = useSharedValue(0);
  const animatedValue = useSharedValue(value ? 1 : 0);
  const thumbScale = useSharedValue(1);

  // Update animated value when prop changes
  React.useEffect(() => {
    // First scale up immediately, then move to position, then scale back down
    thumbScale.value = withSequence(
      withTiming(1.2, { duration: duration * 0.2 }), // Quick scale up
      withTiming(1.2, { duration: duration * 0.6 }), // Hold scale during movement
      withTiming(1, { duration: duration * 0.2 }) // Scale back down after reaching position
    );
    animatedValue.value = withTiming(value ? 1 : 0, { duration });
  }, [value, duration, animatedValue, thumbScale]);

  const handlePress = () => {
    if (!disabled) {
      // Add haptic feedback for better UX
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(!value);
    }
  };

  // Track colors for interpolation
  const trackColors = {
    on: theme.colors.cornflowerBlue,
    off: theme.colors.outline,
  };

  // Animated style for the track (background)
  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(animatedValue.value, [0, 1], [trackColors.off, trackColors.on]);
    const colorValue = withTiming(color, { duration });

    return {
      backgroundColor: colorValue,
      borderRadius: height.value / 2,
      opacity: disabled ? 0.5 : 1,
    };
  });

  // Animated style for the thumb
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(animatedValue.value, [0, 1], [0, width.value - height.value]);
    const translateValue = withTiming(moveValue, { duration });

    // Interpolate shadow elevation based on scale
    const shadowElevation = interpolate(thumbScale.value, [1, 1.2], [2, 8]);

    const shadowOpacity = interpolate(thumbScale.value, [1, 1.2], [0.2, 0.4]);

    return {
      transform: [{ translateX: translateValue }, { scale: thumbScale.value }],
      borderRadius: height.value / 2,
      backgroundColor: theme.colors.surface,
      shadowOpacity,
      elevation: shadowElevation,
    };
  });

  return (
    <HStack gap="md" align="center">
      <Pressable onPress={handlePress} disabled={disabled}>
        <Animated.View
          onLayout={(e) => {
            height.value = e.nativeEvent.layout.height;
            width.value = e.nativeEvent.layout.width;
          }}
          style={[styles.track, trackAnimatedStyle]}>
          <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
        </Animated.View>
      </Pressable>
      {label && (
        <Text size="sm" color={disabled ? 'muted' : 'base'}>
          {label}
        </Text>
      )}
    </HStack>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    width: 44,
    height: 24,
    borderRadius: theme.borderRadius.full,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    shadowColor: theme.shadows.hard[1],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
}));
