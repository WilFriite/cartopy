import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Icon } from './icon';
import { Plus } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FABProps {
  onPress: () => void;
  icon?: any;
  size?: number;
}

export function FAB({ onPress, icon: IconComponent = Plus, size = 56 }: FABProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(rotation.value + 90);
  };

  const handlePress = () => {
    setIsPressed(true);
    // Add a small delay for the animation to start
    setTimeout(() => {
      onPress();
      setTimeout(() => setIsPressed(false), 500);
    }, 100);
  };

  return (
    <AnimatedPressable
      style={[styles.fab, { width: size, height: size }, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
>
      <Icon as={IconComponent} size={24} color="white" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl * 2,
    right: theme.spacing.xl,
    backgroundColor: theme.colors.astral,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 999,
  },
}));