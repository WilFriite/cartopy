import { Stack } from 'expo-router';
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

const defaultValues: ListInsertType = {
  name: '',
  items: '',
};

const itemsRegex = /^(?=.*,.*)|^[A-Za-z0-9 ]+$/;

const schema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit avoir au minimum 3 caractères.')
    .regex(/^[\w\s]+$/, 'Le nom ne doit contenir que des caractères alpha-numériques'),
  items: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim() === '' || itemsRegex.test(value),
      'Use letters, numbers, spaces, and ", " as the only separator'
    ),
});

export default function CreateListPage() {
  const db = useDrizzle();
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
        <VStack gap="lg">
          <form.Field
            name="name"
            asyncDebounceMs={300}
            validators={{
              onChange: schema.shape.name,
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
              onChange: schema.shape.items,
            }}>
            {(field) => (
              <VStack>
                <Textarea
                  label="Items à ajouter"
                  size="md"
                  helperText="Séparés par des virgules…"
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
      </Container>
    </>
  );
}
