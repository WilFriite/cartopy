import React, { createContext, useContext, useId } from 'react';
import { ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { VStack, type StackProps } from './stack';
import { Text } from './typography';
import type { ThemeSpacing } from '~/theme';

type CardContextValue = {
  id: string;
};

const CardContext = createContext<CardContextValue | null>(null);

function useCardContext(componentName: string): CardContextValue {
  const ctx = useContext(CardContext);
  if (!ctx) {
    throw new Error(`${componentName} must be used within a <Card> component.`);
  }
  return ctx;
}

export type CardProps = ViewProps & {
  padding?: keyof ThemeSpacing;
};

const CardRoot = ({ children, style, padding = 'md', ...props }: CardProps) => {
  const id = useId();

  return (
    <CardContext.Provider value={{ id }}>
      <VStack gap={padding} style={[styles.card(padding), style]} {...props}>
        {children}
      </VStack>
    </CardContext.Provider>
  );
};

export type CardSectionProps = StackProps;

const CardHeader = ({ children, style, ...props }: CardSectionProps) => {
  useCardContext('Card.Header');
  return (
    <VStack style={[styles.section, styles.header, style]} {...props}>
      {children}
    </VStack>
  );
};

const CardBody = ({ children, style, ...props }: CardSectionProps) => {
  useCardContext('Card.Body');
  return (
    <VStack style={[styles.section, style]} {...props}>
      {children}
    </VStack>
  );
};

const CardFooter = ({ children, style, ...props }: CardSectionProps) => {
  useCardContext('Card.Footer');
  return (
    <VStack style={[styles.section, styles.footer, style]} {...props}>
      {children}
    </VStack>
  );
};

export type CardTitleProps = React.ComponentProps<typeof Text>;

const CardTitle = ({ children, style, ...props }: CardTitleProps) => {
  useCardContext('Card.Title');
  return (
    <Text size="xl" weight="bold" {...props} style={[styles.title, style]}>
      {children}
    </Text>
  );
};

type CardComponent = React.FC<CardProps> & {
  Header: React.FC<CardSectionProps>;
  Body: React.FC<CardSectionProps>;
  Footer: React.FC<CardSectionProps>;
  Title: React.FC<CardTitleProps>;
};

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
}) as CardComponent;

const styles = StyleSheet.create((theme) => ({
  card: (padding: keyof ThemeSpacing) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderCurve: 'continuous',
    gap: theme.spacing.md,
    elevation: 5,
    width: '100%',
    shadowColor: theme.shadows.hard[1],
    shadowOffset: {
      height: 2,
      width: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginVertical: theme.spacing.md,
    marginHorizontal: 'auto',
    padding: theme.spacing[padding],
  }),
  section: {
    gap: theme.spacing.sm,
  },
  header: {
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outline,
  },
  footer: {
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outline,
  },
  title: {
    // additional styles via Text variants
  },
}));
