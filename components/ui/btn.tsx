import { createContext, forwardRef, useContext } from 'react';
import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Text } from './typography';
import { StyleSheet, UnistylesVariants, useUnistyles } from 'react-native-unistyles';
import { Icon } from './icon';

/* Button container-related code */
type ButtonContextType = UnistylesVariants<typeof styles>;

const ButtonContext = createContext<ButtonContextType | null>(null);

export function useButtonContext() {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error('useButtonContext doit être utilisé dans un Button');
  }
  return context;
}

type BtnProps = TouchableOpacityProps &
  UnistylesVariants<typeof styles> & {
    isLoading?: boolean;
  };

export const Button = forwardRef<View, BtnProps>(
  ({ children, outlined = false, action = 'normal', isLoading = false, ...props }, ref) => {
    styles.useVariants({
      outlined,
      action,
    });
    const { theme } = useUnistyles();

    const contextValue = {
      outlined,
      action,
    } satisfies ButtonContextType;

    const actionColor = action === 'destructive' ? theme.colors.crimson : theme.colors.astral;

    const Component = isLoading ? (
      <ActivityIndicator size="small" color={outlined ? actionColor : theme.colors.white} />
    ) : (
      children
    );

    return (
      <ButtonContext.Provider value={contextValue}>
        <TouchableOpacity ref={ref} {...props} style={[styles.button, props.style]}>
          {Component}
        </TouchableOpacity>
      </ButtonContext.Provider>
    );
  }
);

Button.displayName = 'Button';

/* Button text-related code */
export const ButtonText = (props: React.ComponentProps<typeof Text>) => {
  const { outlined, action } = useButtonContext();
  const color = outlined ? (action === 'destructive' ? 'error' : 'primary') : 'white';
  return (
    <Text
      font="federant"
      size="lg"
      //   weight='black'
      color={color}
      {...props}
    />
  );
};

/* Button icon-related code */
export const ButtonIcon = ({
  name,
  ...props
}: Omit<React.ComponentProps<typeof Icon>, 'color'>) => {
  const { outlined, action } = useButtonContext();
  const color = outlined ? (action === 'destructive' ? 'crimson' : 'astral') : 'white';
  return <Icon name={name} size={18} color={color} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    elevation: 5,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    marginBlock: theme.spacing.sm,
    borderWidth: 1,
    // marginBottom: theme.spacing.s_8,
    shadowColor: theme.shadows.hard[2],
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    variants: {
      outlined: {
        true: {
          backgroundColor: 'transparent',
        },
        false: {
          borderColor: 'transparent',
        },
      },
      action: {
        normal: {},
        destructive: {},
      },
    },
    compoundVariants: [
      {
        outlined: false,
        action: 'normal',
        styles: {
          backgroundColor: theme.colors.astral,
        },
      },
      {
        outlined: false,
        action: 'destructive',
        styles: {
          backgroundColor: theme.colors.crimson,
        },
      },
      {
        outlined: true,
        action: 'normal',
        styles: {
          borderColor: theme.colors.astral,
          backgroundColor: theme.colors.surface,
        },
      },
      {
        outlined: true,
        action: 'destructive',
        styles: {
          borderColor: theme.colors.crimson,
        },
      },
    ],
  },
}));
