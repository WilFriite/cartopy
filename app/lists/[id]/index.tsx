import { Stack, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, Alert, FlatList } from 'react-native';
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
import { PaperUI } from '~/components/ui/paper-sheet';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckableItemsList } from '~/components/ui/checkable-items-list';

export default function ViewTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDrizzle();
  const [showPaperSheet, setShowPaperSheet] = useState(false);

  const { data: list } = useLiveQuery(
    db.query.lists.findFirst({
      where: (lists, { eq }) => eq(lists.id, parseInt(id!)),
    }),
    [id]
  );

  const it = formatListItems(list?.items).map((item, id) => ({
    id,
    name: item,
    completed: false,
  }));

  const markAsPerformedMutation = useMutation({
    mutationFn: async () => {
      return db
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

  // Parse items from JSON string or use empty array
  const lastPerformedAt = list?.lastPerformedAt ? new Date(list.lastPerformedAt) : null;

  return (
    <>
      <Stack.Screen options={{ headerTitle: list?.name }} />
      <View style={styles.container}>
        <SafeAreaView edges={['left', 'right']} style={styles.contentPadding}>
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
          <VStack gap="none" style={[styles.sectionContainer, { flex: 1 }]}>
            <View style={styles.itemsHeader}>
              <View style={styles.headerControls}>
                {it.length > 0 ? (
                  <VStack gap="none" style={styles.progressContainer}>
                    <Text size="sm" color="muted">
                      {it.filter((item) => item.completed).length}/{it.length} articles
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={styles.progressFill(
                          (it.filter((item) => item.completed).length / it.length) * 100
                        )}
                      />
                    </View>
                  </VStack>
                ) : null}
                {it.length > 0 ? (
                  <Button
                    onPress={() => setShowPaperSheet(!showPaperSheet)}
                    outlined
                    style={styles.toggleButton}>
                    <ButtonText>{showPaperSheet ? '📋' : '📄'}</ButtonText>
                  </Button>
                ) : null}
              </View>
            </View>

            {it.length > 0 ? (
              showPaperSheet ? (
                <PaperUI>
                  <CheckableItemsList items={it} />
                </PaperUI>
              ) : (
                <VStack style={{ flex: 1 }}>
                  <FlatList
                    data={it}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.itemCard}>
                        <Text>{item.name}</Text>
                      </View>
                    )}
                  />
                </VStack>
              )
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text size="base" color="muted" align="center">
                  Aucun article dans cette liste
                </Text>
              </View>
            )}
          </VStack>

          {/* Created Date */}
          <View style={styles.sectionContainer}>
            <Text size="sm" color="muted">
              Créée le{' '}
              {DateTime.fromJSDate(new Date(list?.createdAt || ''))
                .setLocale('fr')
                .toLocaleString({
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
            </Text>
          </View>
        </SafeAreaView>
      </View>
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
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionContainer: {
    paddingVertical: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  markAsUsedButton: {
    marginTop: theme.spacing.lg,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerControls: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  progressBar: {
    width: '100%',
    height: theme.spacing.md,
    backgroundColor: theme.colors.outline,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: (width: number) => ({
    width: `${width}%`,
    height: '100%',
    backgroundColor: theme.colors.astral,
  }),
  itemCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  itemDetails: {
    marginTop: theme.spacing.sm,
    marginLeft: theme.spacing['2xl'],
  },
  emptyStateContainer: {
    padding: theme.spacing['2xl'],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: theme.spacing['3xl'],
    flex: 1,
  },
}));
