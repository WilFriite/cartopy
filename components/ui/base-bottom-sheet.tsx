import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useCallback, PropsWithChildren, FC } from 'react';
import { View } from 'react-native';

type Props = {
  snapPoints: (string | number)[];
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  handleSheetChanges?: (index: number) => void;
  onClose?: () => void;
  footerComponent?: FC<BottomSheetFooterProps>;
};

export function BaseBottomSheet({
  snapPoints,
  bottomSheetRef,
  handleSheetChanges,
  onClose,
  children,
  footerComponent,
}: PropsWithChildren<Props>) {
  const { theme } = useUnistyles();
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  return (
    <BottomSheet
      snapPoints={snapPoints}
      ref={bottomSheetRef}
      index={-1}
      onChange={handleSheetChanges}
      onClose={onClose}
      enablePanDownToClose
      style={{
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
      }}
      enableContentPanningGesture
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      footerComponent={footerComponent}
      handleIndicatorStyle={styles.bottomSheetHandleIndicator}>
      <BottomSheetView style={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetContent}>{children}</View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  bottomSheetContainer: {
    flex: 1,
    height: '100%',
  },
  bottomSheetContent: {
    flex: 1,
    height: '100%',
    backgroundColor: rt.colorScheme === 'dark' ? theme.colors.background : theme.colors.surface,
    padding: theme.spacing.md,
  },
  bottomSheetHandleIndicator: {
    backgroundColor: theme.colors.astral,
    width: 50,
  },
}));
