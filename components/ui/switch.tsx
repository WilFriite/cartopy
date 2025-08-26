import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { HStack } from './stack';
import { Text } from './typography';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ value, onValueChange, label, disabled = false }: SwitchProps) {
  const { theme } = useUnistyles();

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <HStack gap="md" align="center">
      <Pressable
        style={[
          styles.track,
          {
            backgroundColor: value ? theme.colors.azureRadiance : theme.colors.outline,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={disabled}>
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateX: value ? 20 : 0 }],
            },
          ]}
        />
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
