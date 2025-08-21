import { View, ScrollView, Alert } from 'react-native';
import { Text, ErrorText } from '~/components/ui/typography';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button, ButtonText } from '~/components/ui/btn';
import { useDrizzle } from '~/hooks/use-drizzle';
import { lists } from '~/db/schema';
import { eq, sql } from 'drizzle-orm';
import { useMutation } from '@tanstack/react-query';
import { VStack } from '~/components/ui/stack';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { StyleSheet } from 'react-native-unistyles';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { formatListItems } from '~/utils/format';


// Validation schemas
const nameSchema = z
  .string()
  .min(3, 'Le nom doit avoir au minimum 3 caractères.')
  .regex(/^[\w\s]+$/, 'Le nom ne doit contenir que des caractères alpha-numériques');

const itemsRegex = /^[A-Za-z0-9 ]+(?:, [A-Za-z0-9 ]+)*(?:[, ])?$/;
const itemsSchema = z
  .string()
  .regex(itemsRegex, 'Use letters, numbers, spaces, and ", " as the only separator');

export default function EditTab() {
  const id = 2;
  const db = useDrizzle();

  const { data: list } = useLiveQuery(
    db.query.lists.findFirst({
      where: (lists, { eq }) => eq(lists.id, Number(id)),
    }),
    [id],
  );

  // Update name mutation
  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      return db
        .update(lists)
        .set({ name })
        .where(eq(lists.id, Number(id)))
        .run();
    },
    onSuccess: () => {
      Alert.alert('Succès', 'Nom de la liste mis à jour avec succès');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du nom');
      console.error('Update name error:', error);
    },
  });

  // Update items mutation
  const updateItemsMutation = useMutation({
    mutationFn: async (items: string) => {
      return db
        .update(lists)
        .set({ items })
        .where(eq(lists.id, Number(id)))
        .run();
    },
    onSuccess: () => {
      Alert.alert('Succès', 'Articles mis à jour avec succès');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour des articles');
      console.error('Update items error:', error);
    },
  });

  // Name form
  const nameForm = useForm({
    defaultValues: {
      name: "mac rosbeat",
    },
    onSubmit: async ({ value }) => {
      await updateNameMutation.mutateAsync(value.name);
    },
  });

  // Items form
  const itemsForm = useForm({
    defaultValues: {
      items: formatListItems(list?.items || '').join(', '),
    },
    onSubmit: async ({ value }) => {
      const formattedItems = formatListItems(value.items)
        .map(item => item[0].toUpperCase() + item.slice(1))
        .join(', ');
      await updateItemsMutation.mutateAsync(formattedItems);
    },
  });

  return (
      <ScrollView style={styles.container}>
        <VStack style={styles.contentPadding}>
          {/* List Name Edit Form */}
          <View style={{ paddingVertical: 16 }}>
            <nameForm.Field
              name="name"
              asyncDebounceMs={300}
              validators={{
                onChange: nameSchema,
                onChangeAsync: async ({ value }) => {
                  if (value === list?.name) return null; // Skip validation if same as current name
                  const found = await db.query.lists.findFirst({
                    where: (lists, { eq, like }) =>
                      like(sql`lower(${lists.name})`, value.toLowerCase()),
                  });
                  if (found) return { message: 'Ce nom de liste est déjà pris' };
                  return null;
                },
              }}>
              {(field) => (
                <VStack gap="sm">
                  <Input
                    label="Nom de la liste"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Nom de la liste"
                    size="lg"
                    isError={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <ErrorText>{field.state.meta.errors[0]?.message}</ErrorText>
                  ) : null}
                </VStack>
              )}
            </nameForm.Field>
            <nameForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  onPress={nameForm.handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  style={{ marginTop: 12 }}>
                  <ButtonText>
                    {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder le nom'}
                  </ButtonText>
                </Button>
              )}
            />
          </View>

          {/* Items Edit Form */}
          <View style={{ paddingVertical: 16 }}>
            <itemsForm.Field
              name="items"
              validators={{
                onChange: itemsSchema,
              }}>
              {(field) => (
                <VStack gap="sm">
                  <Textarea
                    label="Articles"
                    size="md"
                    helperText="Séparés par des virgules… (ex: Pain, Lait, Œufs)"
                    value={field.state.value || ""}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    isError={field.state.meta.errors.length > 0}
                    style={{ minHeight: 100 }}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <ErrorText>{field.state.meta.errors[0]?.message}</ErrorText>
                  ) : null}
                </VStack>
              )}
            </itemsForm.Field>
            <itemsForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  isLoading={isSubmitting}
                  onPress={itemsForm.handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  style={{ marginTop: 12 }}>
                  <ButtonText>
                    {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les articles'}
                  </ButtonText>
                </Button>
              )}
            />
          </View>

          {/* Current Items Preview */}
          {list?.items && (
            <View style={{ paddingVertical: 16 }}>
              <Text size="lg" weight="bold" style={{ marginBottom: 16 }}>
                Articles actuels
              </Text>
              <View
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  padding: 16,
                }}>
                <Text size="base" color="muted">
                  {list.items}
                </Text>
              </View>
            </View>
          )}
        </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: rt.insets.bottom,
  },
  contentPadding: {
    padding: 16,
  },
}));