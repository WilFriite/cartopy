import { View, Pressable, type PressableProps, type LayoutChangeEvent } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ThemeColors } from '~/theme';

export const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const itemLayouts = useRef<{ x: number; width: number }[]>([]);
  const pillLeft = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const updatePillToIndex = (targetIndex: number) => {
    const layout = itemLayouts.current[targetIndex];
    if (!layout) return;
    pillLeft.value = withSpring(layout.x);
    pillWidth.value = withSpring(layout.width);
  };

  useEffect(() => {
    updatePillToIndex(state.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index]);

  const movingPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillLeft.value }],
    width: pillWidth.value,
  }));

  return (
    <View style={styles.tabbar}>
      <Animated.View style={[styles.movingPill, movingPillStyle]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
              ? (options.title as string)
              : route.name;

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const onItemLayout = (e: LayoutChangeEvent) => {
          const { x, width } = e.nativeEvent.layout;
          itemLayouts.current[index] = { x, width };
          if (state.index === index) {
            updatePillToIndex(index);
          }
        };

        return (
          <TabBarButton
            icon={options.tabBarIcon!({
              focused: isFocused,
              size: 20,
              color: '',
            })}
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            onLayout={onItemLayout}
            isFocused={isFocused}
            routeName={route.name}
            label={label}
          />
        );
      })}
    </View>
  );
};

type TabBarButtonProps = PressableProps & {
  isFocused: boolean;
  label: string;
  routeName: string;
  icon: React.ReactNode;
};

const TabBarButton = ({
  isFocused,
  label,
  icon,
  routeName,
  ...pressableProps
}: TabBarButtonProps) => {
  const focus = useSharedValue(isFocused ? 1 : 0);
  const press = useSharedValue(0);

  useEffect(() => {
    focus.value = withSpring(isFocused ? 1 : 0, { damping: 18, stiffness: 160 });
  }, [focus, isFocused]);

  const onPressIn = () => {
    press.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const onPressOut = () => {
    press.value = withSpring(0, { damping: 20, stiffness: 300 });
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    const focusScale = interpolate(focus.value, [0, 1], [1.25, 1.5]);
    const pressScale = interpolate(press.value, [0, 1], [1, 0.95]);
    return {
      transform: [{ scale: focusScale * pressScale }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focus.value, [0, 1], [0, -2]);
    const scale = interpolate(focus.value, [0, 1], [0.9, 1.1]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...pressableProps}
      style={styles.container}>
      <Animated.View style={[animatedIconStyle]}>{icon}</Animated.View>
      <Animated.Text style={[animatedTextStyle, styles.label(isFocused ? 'astral' : 'muted')]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  tabbar: {
    position: 'absolute',
    bottom: theme.spacing['3xl'],
    right: 0,
    flexDirection: 'row',
    width: '55%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    transform: [
      {
        translateX: theme.spacing['2xl'] * -1,
      },
    ],
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    zIndex: 1,
  },
  label: (textColor: keyof ThemeColors) => ({
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors[textColor],
  }),
  movingPill: {
    position: 'absolute',
    height: 50,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.astral,
    opacity: 0.15,
    left: 0,
    zIndex: 0,
  },
}));
