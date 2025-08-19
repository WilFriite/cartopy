import { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

export type StackProps = ViewProps &
  UnistylesVariants<typeof styles> & {
    reverse?: boolean;
  };

type Direction = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type Wrap = 'wrap' | 'nowrap';

export const HStack = forwardRef<View, StackProps>(
  (
    {
      gap = 'md',
      align = 'center',
      justify = 'start',
      wrap = false,
      reverse = false,
      style,
      children,
      ...props
    },
    ref
  ) => {
    styles.useVariants({
      direction: (reverse ? 'row-reverse' : 'row') as Direction,
      align,
      justify,
      wrap: (wrap ? 'wrap' : 'nowrap') as Wrap,
      gap,
    });

    return (
      <View ref={ref} {...props} style={[styles.stack, style]}>
        {children}
      </View>
    );
  }
);

HStack.displayName = 'HStack';

export const VStack = forwardRef<View, StackProps>(
  (
    {
      gap = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      reverse = false,
      style,
      children,
      ...props
    },
    ref
  ) => {
    styles.useVariants({
      direction: reverse ? 'column-reverse' : 'column',
      align,
      justify,
      wrap: wrap ? 'wrap' : 'nowrap',
      gap,
    });

    return (
      <View ref={ref} {...props} style={[styles.stack, style]}>
        {children}
      </View>
    );
  }
);

VStack.displayName = 'VStack';

const styles = StyleSheet.create((theme) => ({
  stack: {
    variants: {
      direction: {
        row: { flexDirection: 'row' },
        'row-reverse': { flexDirection: 'row-reverse' },
        column: { flexDirection: 'column' },
        'column-reverse': { flexDirection: 'column-reverse' },
      },
      align: {
        start: { alignItems: 'flex-start' },
        center: { alignItems: 'center' },
        end: { alignItems: 'flex-end' },
        stretch: { alignItems: 'stretch' },
        baseline: { alignItems: 'baseline' },
      },
      justify: {
        start: { justifyContent: 'flex-start' },
        center: { justifyContent: 'center' },
        end: { justifyContent: 'flex-end' },
        between: { justifyContent: 'space-between' },
        around: { justifyContent: 'space-around' },
        evenly: { justifyContent: 'space-evenly' },
      },
      wrap: {
        wrap: { flexWrap: 'wrap' },
        nowrap: { flexWrap: 'nowrap' },
      },
      gap: {
        sm: { gap: theme.spacing.sm },
        md: { gap: theme.spacing.md },
        lg: { gap: theme.spacing.lg },
        xl: { gap: theme.spacing.xl },
        '2xl': { gap: theme.spacing['2xl'] },
        '3xl': { gap: theme.spacing['3xl'] },
      },
    },
  },
}));
