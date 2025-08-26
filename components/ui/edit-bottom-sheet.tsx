import { CheckableListItem } from './checkable-list-item';
import BottomSheet, { BottomSheetFlatList, BottomSheetFooter } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { PaperUI } from './paper-sheet';
import { useState, useEffect } from 'react';
import { Easing } from 'react-native-reanimated';
import { ProgressBar } from './progress-bar';
import { SwipeButton } from './swipe-button';
import { useMutation } from '@tanstack/react-query';
import { lists } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { useDrizzle } from '~/hooks/use-drizzle';
import { Alert } from 'react-native';
import { wait } from '~/utils/wait';
import { DateTime } from 'luxon';
import { BaseBottomSheet } from './base-bottom-sheet';
import { Check, Clock } from 'lucide-react-native';
import { Text } from './typography';
import { HStack } from './stack';

type Props = {
  listId: number;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  handleSheetChanges?: (index: number) => void;
  it: { name: string; completed: boolean; id: number }[];
  isTemporary?: boolean;
};

export function EditBottomSheet({
  listId,
  bottomSheetRef,
  handleSheetChanges,
  it,
  isTemporary = false,
}: Props) {
  const [items, setItems] = useState(it);
  const snapPoints = ['75%'];
  const db = useDrizzle();

  const checkedPercentage = (items.filter((item) => item.completed).length / items.length) * 100;
  const remainingItems = items.filter((item) => !item.completed);

  // For temporary lists, all items must be completed
  const canCompleteSession = isTemporary ? checkedPercentage === 100 : checkedPercentage > 0;

  const updateItemsMutation = useMutation({
    mutationFn: async (items: string) => {
      await wait(1);
      return db
        .update(lists)
        .set({ items, lastPerformedAt: DateTime.now().toISO() })
        .where(eq(lists.id, Number(listId)))
        .run();
    },
    onSuccess: () => {
      bottomSheetRef.current?.close();
      Alert.alert('Succès', 'Articles mis à jour avec succès');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour des articles');
      console.error('Update items error:', error);
    },
  });

  const handleItemToggle = (id: number, completed: boolean) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed } : item)));
  };

  useEffect(() => {
    if (it.length > 0) {
      setItems(it);
    }
  }, [it]);

  if (items.length === 0) {
    return null;
  }

  return (
    <BaseBottomSheet
      snapPoints={snapPoints}
      bottomSheetRef={bottomSheetRef}
      handleSheetChanges={handleSheetChanges}
      footerComponent={(props) => (
        <BottomSheetFooter {...props}>
          {isTemporary && (
            <HStack gap="sm" align="center" justify="center" style={styles.temporaryNotice}>
              <Clock size={16} color="#6366F1" />
              <Text size="sm" color="primary" weight="medium">
                Liste temporaire : tous les articles doivent être pris
              </Text>
            </HStack>
          )}
          <SwipeButton
            disabled={!canCompleteSession}
            isLoading={updateItemsMutation.isPending}
            style={styles.swipeButton}
            text={isTemporary ? 'Swipe to complete all items' : 'Swipe to save'}
            icon={Check}
            variant="normal"
            onSwipeComplete={() => {
              updateItemsMutation.mutateAsync(remainingItems.map((item) => item.name).join(', '));
            }}
          />
        </BottomSheetFooter>
      )}>
      <ProgressBar
        progress={checkedPercentage}
        duration={1000}
        easing={Easing.bounce}
        showPercentage
      />
      <PaperUI>
        <BottomSheetFlatList
          data={items}
          renderItem={({ item }) => (
            <CheckableListItem item={item} onItemToggle={handleItemToggle} />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </PaperUI>
    </BaseBottomSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  swipeButton: {
    width: '95%',
    alignSelf: 'center',
  },
  temporaryNotice: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.azureRadiance,
    marginBottom: theme.spacing.md,
  },
}));
