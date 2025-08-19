import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, type UnistylesVariants, useUnistyles } from 'react-native-unistyles';
import { Text } from './typography';

type TextareaVariants = UnistylesVariants<typeof styles>;

export type TextareaProps = RNTextInputProps &
  Omit<TextareaVariants, 'variant' | 'state' | 'validation'> & {
    appearance?: 'outline' | 'filled';
    label?: string;
    helperText?: string;
    containerStyle?: StyleProp<ViewStyle>;
    isError?: boolean;
  };

export const Textarea = forwardRef<RNTextInput, TextareaProps>(
  (
    {
      label,
      helperText,
      appearance = 'filled',
      size = 'md',
      editable = true,
      containerStyle,
      placeholderTextColor,
      onFocus,
      onBlur,
      style,
      isError = false,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<RNTextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const { theme } = useUnistyles();

    useImperativeHandle(ref, () => inputRef.current as RNTextInput);

    styles.useVariants({
      size,
      state: editable ? (isFocused ? 'focused' : undefined) : 'disabled',
      validation: isError ? 'error' : 'normal',
    });

    return (
      <View style={styles.container}>
        {label ? (
          <Text size="sm" weight="medium" style={styles.label}>
            {label}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={[styles.fieldWrapper, containerStyle]}>
          <RNTextInput
            ref={inputRef}
            editable={editable}
            multiline
            style={[styles.input, style]}
            textAlignVertical="top"
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            placeholderTextColor={placeholderTextColor ?? theme.colors.muted}
            {...props}
          />
        </TouchableOpacity>

        {helperText ? (
          <Text size="xs" color="muted" style={styles.helper}>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  helper: {
    marginTop: theme.spacing.sm,
  },
  fieldWrapper: {
    width: '100%',
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderColor: theme.colors.outline,
    shadowColor: theme.shadows.hard[5],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    backgroundColor: theme.colors.surface,
    variants: {
      size: {
        sm: {
          minHeight: 80,
        },
        md: {
          minHeight: 120,
        },
        lg: {
          minHeight: 160,
        },
      },
      state: {
        default: {},
        focused: {
          borderColor: theme.colors.astral,
          shadowColor: theme.shadows.hard[2],
          shadowOpacity: 0.25,
        },
        disabled: {
          opacity: 0.6,
        },
      },
      validation: {
        normal: {},
        error: {
          borderColor: theme.colors.crimson,
        },
      },
    },
    compoundVariants: [
      {
        validation: 'error',
        state: 'focused',
        styles: {
          borderColor: theme.colors.crimson,
        },
      },
    ],
  },
  input: {
    color: theme.colors.typography,
    paddingVertical: 0,
    variants: {
      size: {
        sm: {
          fontSize: theme.typography.fontSizes.sm,
        },
        md: {
          fontSize: theme.typography.fontSizes.base,
        },
        lg: {
          fontSize: theme.typography.fontSizes.lg,
        },
      },
    },
  },
}));

export type { TextareaVariants };
