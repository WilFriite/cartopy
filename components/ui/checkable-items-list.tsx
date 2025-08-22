import { View } from 'react-native';
import { Text } from './typography';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useState } from 'react';

type Props = {
  items: { name: string; completed: boolean; id: number }[];
  // onItemToggle: (index: number, completed: boolean) => void;
};

export function CheckableItemsList({ items }: Props) {
  const { theme } = useUnistyles();
  const [sortedItems, setItems] = useState(items);

  const handleItemToggle = (index: number, completed: boolean) => {
    setItems((prevItems) =>
      prevItems.map((item, i) => (item.id === index ? { ...item, completed } : item))
    );
  };

  if (items.length === 0) {
    return (
      <Text size="base" color="muted" style={styles.placeholderText}>
        Vos éléments apparaîtront ici…
      </Text>
    );
  }

  return sortedItems.map((item, index) => (
    <View key={index} style={styles.itemRow}>
      <BouncyCheckbox
        size={20}
        fillColor={theme.colors.azureRadiance}
        unFillColor={theme.colors.surface}
        textStyle={styles.checkboxText}
        isChecked={item.completed}
        onPress={(isChecked: boolean) => {
          const originalIndex = items.findIndex(
            (originalItem) =>
              originalItem.name === item.name && originalItem.completed === item.completed
          );
          handleItemToggle(originalIndex, isChecked);
        }}
        text={`${index + 1}. ${item.name}`}
      />
    </View>
  ));
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
