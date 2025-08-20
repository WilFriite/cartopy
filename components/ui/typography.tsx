import { PropsWithChildren } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';

type TextProps = RNTextProps & UnistylesVariants<typeof styles>;

export function Text({
  color = 'base',
  size = 'base',
  weight = 'medium',
  font = 'nunito',
  align = 'left',
  style,
  ...props
}: TextProps) {
  styles.useVariants({
    color,
    size,
    weight,
    font,
    align,
  });

  return <RNText {...props} style={[styles.text, style]} />;
}

export function ErrorText(props: PropsWithChildren) {
  return <Text size="sm" color="error" weight="bold" {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      color: {
        primary: {
          color: theme.colors.astral,
        },
        base: {
          color: theme.colors.typography,
        },
        muted: {
          color: theme.colors.muted,
        },
        white: {
          color: theme.colors.white,
        },
        error: {
          color: theme.colors.crimson,
        },
      },
      size: {
        xs: {
          fontSize: theme.typography.fontSizes.xs,
        },
        sm: {
          fontSize: theme.typography.fontSizes.sm,
        },
        base: {
          fontSize: theme.typography.fontSizes.base,
        },
        lg: {
          fontSize: theme.typography.fontSizes.lg,
        },
        xl: {
          fontSize: theme.typography.fontSizes['2xl'],
        },
      },
      font: {
        nunito: {
          fontFamily: theme.typography.fontFamilies.nunito,
        },
        federant: {
          fontFamily: theme.typography.fontFamilies.federant,
        },
      },
      weight: {
        light: {
          fontWeight: '100',
        },
        medium: {
          fontWeight: '500',
        },
        bold: {
          fontWeight: '700',
        },
        black: {
          fontWeight: 'black',
        },
      },
      align: {
        left: {
          textAlign: 'left',
        },
        center: {
          textAlign: 'center',
        },
        right: {
          textAlign: 'right',
        },
      },
    },
    compoundVariants: [
      {
        size: 'xl',
        styles: {
          fontWeight: 'bold',
        },
      },
    ],
  },
}));
