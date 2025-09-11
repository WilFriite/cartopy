import { Stack, router } from 'expo-router';
import { Platform, View } from 'react-native';
import { Button, ButtonText } from '~/components/ui/btn';

import { Container } from '~/components/ui/container';
import { Input } from '~/components/ui/input';
import { ErrorText, Text } from '~/components/ui/typography';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { lists, type ListInsertType } from '~/db/schema';
import { useMutation } from '@tanstack/react-query';
import { useDrizzle } from '~/hooks/use-drizzle';
import { VStack } from '~/components/ui/stack';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { Icon } from '~/components/ui/icon';
import { Pressable } from 'react-native';
import { sql } from 'drizzle-orm';
import { formatListItems } from '~/utils/format';
import { KeyboardAvoidingView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { useKbdHeight } from '~/hooks/use-kbd-height';
import { StyleSheet } from 'react-native-unistyles';

const defaultValues: ListInsertType = {
  name: '',
  items: '',
};

const AnimatedView = Animated.View;

const nameSchema = z
  .string()
  .min(3, 'Le nom doit avoir au minimum 3 caractères.')
  .regex(
    /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s]+$/,
    'Le nom ne doit contenir que des lettres, chiffres et espaces.'
  );

// Removed items validation as we're not using items field anymore

export default function CreateListPage() {
  const db = useDrizzle();
  const { height } = useKbdHeight();

  const saveUserMutation = useMutation({
    mutationFn: async (value: ListInsertType) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await db.insert(lists).values({
        name: value.name,
        items: '', // Empty items for now
      });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ formApi, value }) => {
      console.log(value);
      await saveUserMutation.mutateAsync(value);
      formApi.reset();
      router.back();
    },
  });

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'fade',
        }} 
      />
      <AnimatedView 
          entering={FadeIn.duration(300)}
        style={styles.modalBackdrop}>
        <Pressable 
          style={styles.backdropPressable} 
          onPress={handleClose}
        />
        <AnimatedView
          entering={SlideInDown.duration(400).springify()}
          style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text size="xl" weight="bold">Nouvelle liste</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Icon as={X} size={24} color="muted" />
            </Pressable>
          </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={height.value + 30}
          style={styles.keyboardAvoidingView}>
          <VStack justify="between">
            <form.Field
              name="name"
              asyncDebounceMs={300}
              validators={{
                onChange: nameSchema,
                onChangeAsync: async ({ value, fieldApi }) => {
                  const found = await db.query.lists.findFirst({
                    where: (lists, { eq, like }) =>
                      like(sql`lower(${lists.name})`, value.toLowerCase()),
                  });

                  if (found) return { message: 'Ce nom de liste est déjà pris' };
                  return null;
                },
              }}>
              {(field) => (
                <VStack>
                  <Input
                    label="Nom de la liste"
                    size="lg"
                    id={field.name}
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    isError={field.state.meta.errors.length > 0}
                    placeholder="Ex: Courses de la semaine"
                    autoFocus
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <ErrorText>{field.state.meta.errors[0]?.message}</ErrorText>
                  ) : null}
                </VStack>
              )}
            </form.Field>

            {/* Items input removed as per requirements */}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  action="normal"
                  isLoading={isSubmitting}
                  disabled={!canSubmit}
                  onPress={form.handleSubmit}>
                  <ButtonText>Créer</ButtonText>
                </Button>
              )}
            </form.Subscribe>
          </VStack>
        </KeyboardAvoidingView>
        </AnimatedView>
      </AnimatedView>
      <KeyboardToolbar showArrows={false} insets={{ left: 16, right: 0 }} doneText="Fermer" />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    marginTop: 100,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
}));
