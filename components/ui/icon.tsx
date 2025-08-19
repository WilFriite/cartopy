import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ThemeColors } from '~/theme';

export const Icon = ({
  color,
  ...props
}: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  size?: number;
  color: keyof ThemeColors;
}) => {
  const { theme } = useUnistyles();
  const selectedColor = theme.colors[color];
  return <FontAwesome style={styles.tabBarIcon} color={selectedColor} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  tabBarIcon: {},
}));
