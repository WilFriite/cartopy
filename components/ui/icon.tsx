import { useUnistyles } from 'react-native-unistyles';
import type { ThemeColors } from '~/theme';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

type Props = LucideProps & {
  as: LucideIcon;
  size?: number;
  color: keyof ThemeColors;
};

export const Icon = ({ color, as, ...props }: Props) => {
  const { theme } = useUnistyles();
  const selectedColor = theme.colors[color];
  const Component = as;
  return <Component color={selectedColor} {...props} />;
};
