import { CheckableListItem } from './checkable-list-item';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { PaperUI } from './paper-sheet';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Easing } from 'react-native-reanimated';
import { ProgressBar } from './progress-bar';
import { SwipeButton } from './swipe-button';
import { useMutation } from '@tanstack/react-query';
import { lists } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { useDrizzle } from '~/hooks/use-drizzle';
import { Alert, View } from 'react-native';
import { wait } from '~/utils/wait';
import { DateTime } from 'luxon';
import { BaseBottomSheet } from './base-bottom-sheet';

type Props = {
  listId: number;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  handleSheetChanges?: (index: number) => void;
  it: { name: string; completed: boolean; id: number }[];
  onClose: () => void;
};

export function EditBottomSheet({
  listId,
  bottomSheetRef,
  handleSheetChanges,
  it,
  onClose,
}: Props) {
  const [items, setItems] = useState(it);
  const snapPoints = ['75%'];
  const db = useDrizzle();
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const checkedPercentage = useMemo(() => {
    return (items.filter((item) => item.completed).length / items.length) * 100;
  }, [items]);

  const remainingItems = items.filter((item) => !item.completed);

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
      Alert.alert('Succès', 'Articles mis à jour avec succès');
      onClose();
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
      onClose={onClose}
      handleSheetChanges={handleSheetChanges}
      footerComponent={(props) => (
        <BottomSheetFooter {...props}>
          <SwipeButton
            disabled={checkedPercentage <= 0}
            isLoading={updateItemsMutation.isPending}
            style={styles.swipeButton}
            text="Swipe to save"
            iconName="check"
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
}));
