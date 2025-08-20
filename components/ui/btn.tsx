import { createContext, forwardRef, useContext } from 'react';
import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Text } from './typography';
import { StyleSheet, UnistylesVariants, useUnistyles } from 'react-native-unistyles';
import { Icon } from './icon';

/* Button container-related code */
type ButtonVariantContextType = UnistylesVariants<typeof styles>;

const ButtonVariantContext = createContext<ButtonVariantContextType | null>(null);

export function useButtonVariant() {
  const context = useContext(ButtonVariantContext);
  if (!context) {
    throw new Error('useButtonVariant doit être utilisé dans un Button');
  }
  return context;
}

type BtnProps = TouchableOpacityProps &
  UnistylesVariants<typeof styles> & {
    isLoading?: boolean;
  };

export const Button = forwardRef<View, BtnProps>(
  ({ children, variant = 'solid', isLoading = false, ...props }, ref) => {
    styles.useVariants({
      variant,
    });
    const { theme } = useUnistyles();
    const contextValue = {
      variant,
    } satisfies ButtonVariantContextType;

    const Component = isLoading ? (
      <ActivityIndicator
        size="small"
        color={variant === 'outline' ? theme.colors.astral : theme.colors.white}
      />
    ) : (
      children
    );

    return (
      <ButtonVariantContext.Provider value={contextValue}>
        <TouchableOpacity ref={ref} {...props} style={[styles.button, props.style]}>
          {Component}
        </TouchableOpacity>
      </ButtonVariantContext.Provider>
    );
  }
);

Button.displayName = 'Button';

/* Button text-related code */
export const ButtonText = (props: React.ComponentProps<typeof Text>) => {
  const { variant } = useButtonVariant();
  return (
    <Text
      font="federant"
      size="lg"
      //   weight='black'
      color={variant === 'outline' ? 'primary' : 'white'}
      {...props}
    />
  );
};

/* Button icon-related code */
export const ButtonIcon = ({
  name,
  ...props
}: Omit<React.ComponentProps<typeof Icon>, 'color'>) => {
  const { variant } = useButtonVariant();
  return <Icon name={name} size={18} color={variant === 'solid' ? 'white' : 'astral'} {...props} />;
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
      variant: {
        solid: {
          backgroundColor: theme.colors.astral,
          borderColor: 'transparent',
        },
        outline: {
          backgroundColor: 'transparent',
          borderColor: theme.colors.astral,
        },
      },
    },
  },
}));
