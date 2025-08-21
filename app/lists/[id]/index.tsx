import { Stack, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, Alert } from 'react-native';
import { Text } from '~/components/ui/typography';
import { Button, ButtonText } from '~/components/ui/btn';
import { useDrizzle } from '~/hooks/use-drizzle';
import { lists } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { useMutation } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { VStack } from '~/components/ui/stack';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { formatListItems } from '~/utils/format';
import { StyleSheet } from 'react-native-unistyles';

export default function ViewTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDrizzle();

  const { data: list } = useLiveQuery(
    db.query.lists.findFirst({
      where: (lists, { eq }) => eq(lists.id, parseInt(id!)),
    }),
    [id]
  );

  const markAsPerformedMutation = useMutation({
    mutationFn: async () => {
      return await db
        .update(lists)
        .set({
          lastPerformedAt: DateTime.now().toISO(),
        })
        .where(eq(lists.id, parseInt(id!)))
        .run();
    },
    onSuccess: () => {
      Alert.alert('Succès', 'Liste marquée comme utilisée');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour');
      console.error('Mark as performed error:', error);
    },
  });

  //   if (isLoading) {
  //     return (
  //       <Container>
  //         <Text size="lg">Chargement...</Text>
  //       </Container>
  //     );
  //   }

  //   if (!list) {
  //     return (
  //       <Container>
  //         <Text size="lg" color="error">Erreur lors du chargement de la liste</Text>
  //       </Container>
  //     );
  //   }

  // Parse items from JSON string or use empty array

  const lastPerformedAt = list?.lastPerformedAt ? new Date(list.lastPerformedAt) : null;
  const items = formatListItems(list?.items).map((item) => ({
    name: item,
    completed: false,
  }));

  return (
    <>
      <Stack.Screen options={{ headerTitle: list?.name }} />
      <ScrollView style={styles.container}>
        <VStack gap="xl" style={styles.contentPadding}>
          {/* Last Performed Section */}
          <View style={styles.sectionContainer}>
            <Text size="lg" weight="bold" style={styles.sectionTitle}>
              Dernière utilisation
            </Text>
            {lastPerformedAt ? (
              <Text size="base" color="muted">
                {DateTime.fromJSDate(lastPerformedAt).toLocaleString({
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            ) : (
              <Text size="base" color="muted">
                Cette liste n&apos;a jamais été utilisée
              </Text>
            )}

            <Button
              onPress={() => markAsPerformedMutation.mutate()}
              disabled={markAsPerformedMutation.isPending}
              style={styles.markAsUsedButton}>
              <ButtonText>
                {markAsPerformedMutation.isPending ? 'Mise à jour...' : 'Marquer comme utilisée'}
              </ButtonText>
            </Button>
          </View>

          {/* Items Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.itemsHeader}>
              <Text size="lg" weight="bold">
                Articles ({items.length})
              </Text>
              {items.length > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(items.filter((item) => item.completed).length / items.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text size="sm" color="muted">
                    {items.filter((item) => item.completed).length}/{items.length}
                  </Text>
                </View>
              )}
            </View>

            {items.length > 0 ? (
              <VStack gap="md">
                {items.map((item: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.itemCard, item.completed && styles.itemCardCompleted]}>
                    <View style={styles.itemContent}>
                      <View
                        style={[
                          styles.checkbox,
                          item.completed ? styles.checkboxChecked : styles.checkboxUnchecked,
                        ]}>
                        {item.completed && (
                          <Text size="xs" color="white" weight="bold">
                            ✓
                          </Text>
                        )}
                      </View>
                      <Text
                        size="base"
                        weight="medium"
                        style={{
                          textDecorationLine: item.completed ? 'line-through' : 'none',
                        }}>
                        {item.name || item}
                      </Text>
                    </View>
                    {item.quantity && (
                      <Text size="sm" color="muted" style={styles.itemDetails}>
                        Quantité: {item.quantity}
                      </Text>
                    )}
                    {item.notes && (
                      <Text size="sm" color="muted" style={styles.itemDetails}>
                        Notes: {item.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </VStack>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text size="base" color="muted" align="center">
                  Aucun article dans cette liste
                </Text>
              </View>
            )}
          </View>

          {/* Created Date */}
          <View style={styles.sectionContainer}>
            <Text size="sm" color="muted">
              Créée le {DateTime.fromJSDate(new Date(list?.createdAt || '')).setLocale('fr').toLocaleString({
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </VStack>
      </ScrollView>
    </>
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
  sectionContainer: {
    paddingVertical: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  markAsUsedButton: {
    marginTop: 12,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 60,
    height: 8,
    backgroundColor: theme.colors.outline,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.astral,
  },
  itemCard: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemCardCompleted: {
    opacity: 0.6,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    borderColor: theme.colors.outline,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    borderColor: theme.colors.astral,
    backgroundColor: theme.colors.astral,
  },
  itemDetails: {
    marginTop: 4,
    marginLeft: 28,
  },
  emptyStateContainer: {
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
  },
}));
