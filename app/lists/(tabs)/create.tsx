import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { Button, ButtonText } from '~/components/ui/btn';

import { Container } from '~/components/ui/container';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { ErrorText, Text } from '~/components/ui/typography';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { lists, type ListInsertType } from '~/db/schema';
import { useMutation } from '@tanstack/react-query';
import { useDrizzle } from '~/hooks/use-drizzle';
import { VStack } from '~/components/ui/stack';
import { sql } from 'drizzle-orm';
import { formatListItems } from '~/utils/format';
import { KeyboardAvoidingView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { useKbdHeight } from '~/hooks/use-kbd-height';

const defaultValues: ListInsertType = {
  name: '',
  items: '',
};

const nameSchema = z
  .string()
  .min(3, 'Le nom doit avoir au minimum 3 caractères.')
  .regex(
    /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s]+$/,
    'Le nom ne doit contenir que des lettres, chiffres et espaces.'
  );

const itemsRegex = /^[A-Za-z0-9 ,]+$/;

const itemsSchema = z
  .string()
  .default('')
  .refine(
    (value) => !value || value.trim() === '' || itemsRegex.test(value),
    'Seulement des lettres, chiffres, espaces et virgules sont autorisés.'
  );

export default function CreateListPage() {
  const db = useDrizzle();
  const { height } = useKbdHeight();

  const saveUserMutation = useMutation({
    mutationFn: async (value: ListInsertType) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const formattedItems = formatListItems(value.items)
        .map((item) => item[0].toUpperCase() + item.slice(1))
        .join(', ');
      await db.insert(lists).values({
        ...value,
        items: formattedItems,
      });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ formApi, value }) => {
      console.log(value);
      await saveUserMutation.mutateAsync(value);
      formApi.reset();
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Ajouter' }} />
      <Container>
        <Text size="xl" align="center">
          Création
        </Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={height.value + 30}
          style={{ flex: 1 }}>
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
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <ErrorText>{field.state.meta.errors[0]?.message}</ErrorText>
                  ) : null}
                </VStack>
              )}
            </form.Field>

            <form.Field
              name="items"
              validators={{
                onChange: itemsSchema,
              }}>
              {(field) => (
                <VStack>
                  <Textarea
                    label="Articles à ajouter"
                    size="md"
                    helperText="Séparés par des virgules… (ex: Pain, Lait, Œufs)"
                    id={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    isError={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <ErrorText>{field.state.meta.errors[0]?.message}</ErrorText>
                  ) : null}
                </VStack>
              )}
            </form.Field>
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
      </Container>
      <KeyboardToolbar showArrows={false} insets={{ left: 16, right: 0 }} doneText="Fermer" />
    </>
  );
}
