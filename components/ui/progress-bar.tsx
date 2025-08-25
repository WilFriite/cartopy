import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';
import { Text } from './typography';

export type ProgressBarProps = ViewProps &
  UnistylesVariants<typeof styles> & {
    /**
     * Progress value between 0 and 100
     */
    progress: number;
    /**
     * Animation duration in milliseconds
     * @default 500
     */
    duration?: number;
    /**
     * Show percentage text
     * @default false
     */
    showPercentage?: boolean;
    /**
     * Custom percentage text color
     */
    textColor?: 'primary' | 'base' | 'muted' | 'white';
    /**
     * Animation easing function
     * @default Easing.bezier(0.4, 0.0, 0.2, 1)
     */
    easing?: (value: number) => number;
    /**
     * Size variant
     */
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };

export function ProgressBar({
  progress = 0,
  duration = 500,
  showPercentage = false,
  textColor = 'base',
  size = 'md',
  easing,
  style,
  ...props
}: ProgressBarProps) {
  const progressValue = useSharedValue(0);

  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  useEffect(() => {
    progressValue.value = withTiming(clampedProgress, {
      duration,
      easing: easing || Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  }, [clampedProgress, duration, easing, progressValue]);

  styles.useVariants({
    size,
  });

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = progressValue.value > 0 ? 1 : 0.7;
    return {
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.progressContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, animatedFillStyle]} />
        </View>
        {showPercentage && (
          <Animated.View style={animatedTextStyle}>
            <Text size="sm" color={textColor} weight="medium" style={styles.percentageText}>
              {Math.round(clampedProgress)}%
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  track: {
    flex: 1,
    backgroundColor: theme.colors.outline,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.full,
    variants: {
      size: {
        sm: {
          height: 4,
        },
        md: {
          height: 8,
        },
        lg: {
          height: 12,
        },
        xl: {
          height: 16,
        },
      },
      variant: {
        primary: {},
        success: {},
        warning: {},
        error: {},
      },
    },
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.astral,
    borderRadius: theme.borderRadius.full,
  },
  percentageText: {
    minWidth: 40,
    textAlign: 'right',
  },
}));
