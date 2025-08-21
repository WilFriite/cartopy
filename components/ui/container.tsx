import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>{children}</SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    paddingBottom: rt.insets.bottom,
  },
  inner: {
    flex: 1,
  },
}));
