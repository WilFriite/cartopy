import { View, type ViewProps } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';
import type { ThemeSpacing } from '~/theme';

export type DividerProps = ViewProps &
  UnistylesVariants<typeof styles> & {
    /** Orientation of the divider */
    orientation?: 'horizontal' | 'vertical';
    /** Spacing around the divider */
    spacing?: keyof ThemeSpacing;
    /** Custom width (only for horizontal orientation) */
    width?: number;
    /** Custom height (only for vertical orientation) */
    height?: number;
  };

export function Divider({
  color = 'muted',
  orientation = 'horizontal',
  spacing = 'md',
  width,
  height,
  style,
  ...props
}: DividerProps) {
  // Validation: throw error if wrong dimension is set for orientation
  if (orientation === 'horizontal' && height !== undefined) {
    throw new Error('Cannot set height for horizontal divider. Use width instead.');
  }
  if (orientation === 'vertical' && width !== undefined) {
    throw new Error('Cannot set width for vertical divider. Use height instead.');
  }

  styles.useVariants({
    color,
  });

  return (
    <View
      {...props}
      style={[
        styles.divider,
        styles.orientation(orientation, height, width),
        styles.spacing(spacing, orientation),
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  divider: {
    variants: {
      color: {
        muted: {
          backgroundColor: theme.colors.muted,
        },
        primary: {
          backgroundColor: theme.colors.astral,
        },
      },
    },
  },
  spacing: (spacing: keyof ThemeSpacing, orientation: 'horizontal' | 'vertical') => {
    if (orientation === 'horizontal') {
      return {
        marginVertical: theme.spacing[spacing],
      };
    } else {
      return {
        marginHorizontal: theme.spacing[spacing],
      };
    }
  },
  orientation: (orientation: 'horizontal' | 'vertical', height?: number, width?: number) => {
    if (orientation === 'horizontal') {
      return {
        width: width ?? '100%',
        height: StyleSheet.hairlineWidth,
      };
    } else {
      return {
        height: height ?? '100%',
        width: StyleSheet.hairlineWidth,
      };
    }
  },
}));
