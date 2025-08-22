import { CheckableListItem } from './checkable-list-item';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { PaperUI } from './paper-sheet';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Easing } from 'react-native-reanimated';
import { ProgressBar } from './progress-bar';
import { SwipeButton } from './swipe-button';

type Props = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  handleSheetChanges?: (index: number) => void;
  it: { name: string; completed: boolean; id: number }[];
  onClose: () => void;
};

export function EditBottomSheet({ bottomSheetRef, handleSheetChanges, it, onClose }: Props) {
  const [items, setItems] = useState(it);
  const snapPoints = useMemo(() => ['75%'], []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const checkedPercentage = useMemo(() => {
    return (items.filter((item) => item.completed).length / items.length) * 100;
  }, [items]);

  const handleItemToggle = (id: number, completed: boolean) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed } : item)));
  };

  useEffect(() => {
    if (it.length > 0) {
      setItems(it);
    }
  }, [it]);

  return (
    <BottomSheet
      snapPoints={snapPoints}
      ref={bottomSheetRef}
      index={0}
      onChange={handleSheetChanges}
      onClose={onClose}
      enablePanDownToClose
      enableContentPanningGesture
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.bottomSheetHandleIndicator}>
      <BottomSheetView style={styles.bottomSheetContent}>
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
        <SwipeButton
          disabled={checkedPercentage <= 0}
          style={styles.swipeButton}
          text="Swipe to save"
          iconName="check"
          variant="normal"
          onSwipeComplete={() => {
            console.log('Item saved!');
          }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: 'grey',
  },
  bottomSheetContent: {
    flex: 1,
    height: '100%',
    padding: theme.spacing.md,
  },
  bottomSheetHandleIndicator: {
    backgroundColor: theme.colors.astral,
  },
  swipeButton: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
}));
