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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Divider } from '~/components/ui/divider';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDrizzle();
  const router = useRouter();

  const { data: list } = useLiveQuery(
    db.query.lists.findFirst({
      where: (lists, { eq }) => eq(lists.id, Number(id)),
    }),
    [id]
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

  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      return db.delete(lists).where(eq(lists.id, id)).run();
    },
    onSuccess: () => {
      Alert.alert('Succès', 'Liste supprimée avec succès');
      router.replace('/lists');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la suppression de la liste');
      console.error('Delete list error:', error);
    },
  });
  // Name form
  const nameForm = useForm({
    defaultValues: {
      name: list?.name!,
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
        .map((item) => item[0].toUpperCase() + item.slice(1))
        .join(', ');
      await updateItemsMutation.mutateAsync(formattedItems);
    },
  });

  const handleDeleteList = () => {
    Alert.alert(
      `Supprimer la liste "${list?.name}"`,
      'Cette action est irréversible. Êtes-vous sûr de vouloir supprimer la liste ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteListMutation.mutate(Number(id)),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <VStack>
        <VStack gap="lg">
          <Text size="lg" weight="bold" style={{ marginBottom: 16 }}>
            Édition de la liste
          </Text>
          {/* List Name Edit Form */}
          <View>
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
            <nameForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  onPress={nameForm.handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  style={{ marginTop: 12 }}>
                  <ButtonText>{isSubmitting ? 'Sauvegarde...' : 'Sauvegarder le nom'}</ButtonText>
                </Button>
              )}
            </nameForm.Subscribe>
          </View>

          <Divider spacing="lg" width={200} style={{ alignSelf: 'center' }} />

          {/* Items Edit Form */}
          <View>
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
                    value={field.state.value || ''}
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
            <itemsForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
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
            </itemsForm.Subscribe>
          </View>
        </VStack>
        <Divider spacing="lg" />
        <VStack gap="md">
          <Text size="lg" weight="bold" style={{ marginBottom: 16 }}>
            Suppression de la liste
          </Text>
          <Button action="destructive" onPress={handleDeleteList}>
            <ButtonText>Supprimer la liste</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: rt.insets.bottom,
    padding: 16,
  },
}));
