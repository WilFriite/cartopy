import { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemeColors } from '~/theme';

export type DashedBoxProps = ViewProps & {
  borderColor?: keyof ThemeColors;
  backgroundColor?: keyof ThemeColors;
};

export const DashedBox = forwardRef<View, DashedBoxProps>(
  ({ borderColor, backgroundColor, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[style, styles.dashedBox({ backgroundColor, borderColor })]}
        {...props}
      />
    );
  }
);

DashedBox.displayName = 'DashedBox';

const styles = StyleSheet.create((theme) => ({
  dashedBox: ({
    backgroundColor,
    borderColor,
  }: {
    backgroundColor?: keyof ThemeColors;
    borderColor?: keyof ThemeColors;
  }) => ({
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors[borderColor || 'outline'],
    backgroundColor: theme.colors[backgroundColor || 'surface'],
  }),
}));
