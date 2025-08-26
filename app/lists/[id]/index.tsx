import { useLocalSearchParams } from 'expo-router';
import { View, FlatList } from 'react-native';
import { Text } from '~/components/ui/typography';
import { Button, ButtonText } from '~/components/ui/btn';
import { useDrizzle } from '~/hooks/use-drizzle';
import { DateTime } from 'luxon';
import { HStack, VStack } from '~/components/ui/stack';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { formatListItems } from '~/utils/format';
import { StyleSheet } from 'react-native-unistyles';
import { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type BottomSheet from '@gorhom/bottom-sheet';
import { EditBottomSheet } from '~/components/ui/edit-bottom-sheet';
import { Clock } from 'lucide-react-native';

export default function ViewTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDrizzle();

  const bottomSheetRef = useRef<BottomSheet>(null);

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

  const lastPerformedBase = DateTime.fromISO(list?.lastPerformedAt || '').setLocale('fr');

  const lastPerformedAt = lastPerformedBase.isValid
    ? lastPerformedBase.toLocaleString({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const createdAt = DateTime.fromJSDate(new Date(list?.createdAt || ''))
    .setLocale('fr')
    .toLocaleString({
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handleBottomSheetOpen = () => {
    bottomSheetRef.current?.expand();
  };

  const isTemporary = list?.isTemporary || false;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView edges={['left', 'right']} style={styles.contentPadding}>
        {/* Temporary List Notice */}
        {isTemporary && (
          <View style={styles.temporaryNotice}>
            <HStack gap="sm" align="center">
              <Clock size={20} color="#6366F1" />
              <VStack gap="sm">
                <Text size="lg" weight="bold" color="primary">
                  Liste temporaire
                </Text>
                <Text size="sm" color="muted">
                  Tous les articles doivent être pris avant de terminer la session de courses.
                </Text>
              </VStack>
            </HStack>
          </View>
        )}

        {/* Last Performed Section */}
        <View style={styles.sectionContainer}>
          <Text size="lg" weight="bold" style={styles.sectionTitle}>
            Dernière utilisation
          </Text>
          <Text size="base" color="muted">
            {lastPerformedAt ? lastPerformedAt : "Cette liste n'a jamais été utilisée"}
          </Text>
        </View>

        {/* Items Section */}
        <VStack gap="none" style={[styles.sectionContainer, { flex: 1 }]}>
          <View style={styles.itemsHeader}>
            <View style={styles.headerControls}>
              {it.length > 0 ? (
                <HStack>
                  <Text size="base" color="muted" align="center">
                    {it.length} articles à acheter.
                  </Text>
                  <Button onPress={handleBottomSheetOpen} outlined style={styles.toggleButton}>
                    <ButtonText>It&apos;s grocery timee! 🛒</ButtonText>
                  </Button>
                </HStack>
              ) : null}
            </View>
          </View>

          {it.length > 0 ? (
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
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text size="lg" weight="bold" color="muted" align="center">
                Aucun article dans cette liste.
              </Text>
              <Text size="sm" color="muted" align="center">
                Vous pouvez en ajouter dans l&apos;onglet{' '}
                <Text size="sm" weight="bold" color="muted" align="center">
                  &quot;Modification&quot;
                </Text>{' '}
                juste à côté.
              </Text>
            </View>
          )}
        </VStack>

        {/* Created Date */}
        <View style={styles.sectionContainer}>
          <Text size="sm" color="muted">
            Créée le {createdAt}
          </Text>
        </View>

        <EditBottomSheet
          listId={Number(id)}
          bottomSheetRef={bottomSheetRef}
          it={it}
          isTemporary={isTemporary}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
  temporaryNotice: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.azureRadiance,
    marginTop: theme.spacing.lg,
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
