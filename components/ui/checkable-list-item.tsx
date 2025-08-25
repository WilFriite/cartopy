import { View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  item: { name: string; completed: boolean; id: number };
  onItemToggle: (index: number, completed: boolean) => void;
};

export function CheckableListItem({ item, onItemToggle }: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.itemRow}>
      <BouncyCheckbox
        size={20}
        fillColor={theme.colors.azureRadiance}
        unFillColor={theme.colors.surface}
        textStyle={styles.checkboxText}
        isChecked={item.completed}
        onPress={(isChecked: boolean) => {
          onItemToggle(item.id, isChecked);
        }}
        text={`${item.name}`}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
    minHeight: 24,
  },
  checkboxText: {
    fontSize: theme.typography.fontSizes.base,
    fontFamily: theme.typography.fontFamilies.nunito,
    color: theme.colors.typography,
  },
  itemText: {
    lineHeight: 24,
    color: theme.colors.typography,
  },
  placeholderText: {
    lineHeight: 24,
    fontStyle: 'italic',
  },
}));
