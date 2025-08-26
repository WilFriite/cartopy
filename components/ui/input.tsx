import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, type UnistylesVariants, useUnistyles } from 'react-native-unistyles';
import { Text } from './typography';
import { Icon } from './icon';

type InputVariants = UnistylesVariants<typeof styles>;

export type InputProps = RNTextInputProps &
  Omit<InputVariants, 'variant' | 'state' | 'validation'> & {
    appearance?: 'outline' | 'filled';
    label?: string;
    helperText?: string;
    leftIcon?: React.ComponentProps<typeof Icon>['as'];
    rightIcon?: React.ComponentProps<typeof Icon>['as'];
    containerStyle?: StyleProp<ViewStyle>;
    isError?: boolean;
  };

export const Input = forwardRef<RNTextInput, InputProps>(
  (
    {
      label,
      helperText,
      leftIcon,
      rightIcon,
      appearance = 'outline',
      size = 'md',
      editable = true,
      containerStyle,
      placeholderTextColor,
      onFocus,
      onBlur,
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
          {leftIcon ? <Icon as={leftIcon} size={18} color={isError ? 'crimson' : 'muted'} /> : null}
          <RNTextInput
            ref={inputRef}
            editable={editable}
            style={styles.input}
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
          {rightIcon ? (
            <Icon
              as={rightIcon}
              size={18}
              color={isError ? 'crimson' : isFocused ? 'astral' : 'muted'}
            />
          ) : null}
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

Input.displayName = 'Input';

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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outline,
    shadowColor: theme.shadows.hard[5],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    variants: {
      size: {
        sm: {
          minHeight: 36,
          paddingVertical: theme.spacing.sm,
        },
        md: {
          minHeight: 44,
          paddingVertical: theme.spacing.md,
        },
        lg: {
          minHeight: 52,
          paddingVertical: theme.spacing.lg,
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
    flex: 1,
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

export type { InputVariants };
