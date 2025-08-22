import React, { useState } from 'react';
import { type PropsWithChildren } from 'react';
import { View, ScrollView, LayoutChangeEvent } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  lineSpacing?: number;
  showMargin?: boolean;
  marginWidth?: number;
  containerHeight?: number; // Optional explicit height, otherwise will be calculated from layout
};

export function PaperUI({
  lineSpacing = 24,
  showMargin = true,
  marginWidth = 40,
  containerHeight,
  children,
}: PropsWithChildren<Props>) {
  const [calculatedLines, setCalculatedLines] = useState(0);

  // Calculate number of lines based on container height
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    const usableHeight = height - 60; // Account for padding (30px top + 30px bottom)
    const calculatedLinesCount = Math.floor(usableHeight / lineSpacing);
    setCalculatedLines(Math.max(1, calculatedLinesCount)); // Ensure at least 1 line
  };

  // Use containerHeight prop if provided, otherwise use layout calculation
  React.useEffect(() => {
    if (containerHeight) {
      const usableHeight = containerHeight - 60; // Account for padding
      const calculatedLinesCount = Math.floor(usableHeight / lineSpacing);
      setCalculatedLines(Math.max(1, calculatedLinesCount));
    }
  }, [containerHeight, lineSpacing]);

  const finalNumberOfLines = calculatedLines;

  const renderLines = () => {
    const lines = Array.from({ length: finalNumberOfLines }, (_, i) => (
      <View key={i} style={[styles.horizontalLine, { top: 30 + i * lineSpacing }]} />
    ));
    return lines;
  };

  return (
    <View style={styles.paperContainer} onLayout={handleContainerLayout}>
      {/* Red margin line */}
      {showMargin && <View style={[styles.marginLine, { left: marginWidth }]} />}

      {/* Horizontal lines background */}

      {/* Content area */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.linesContainer}>{renderLines()}</View>
        <View style={styles.contentArea}>
          <View style={[styles.itemsContainer, { marginLeft: showMargin ? marginWidth + 20 : 20 }]}>
            {children}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  paperContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: theme.shadows.hard[2],
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    margin: theme.spacing.xl,
  },
  marginLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.crimson,
    zIndex: 1,
  },
  linesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  horizontalLine: {
    position: 'absolute',
    left: 50,
    right: 16,
    height: 1,
    backgroundColor: theme.colors.outline,
  },
  contentArea: {
    flex: 1,
    paddingTop: 20,
    paddingRight: 16,
    paddingBottom: 20,
    zIndex: 2,
  },
  itemsContainer: {
    gap: 20,
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
    minHeight: 24,
  },
  checkboxIcon: {
    borderColor: theme.colors.crimson,
    borderWidth: 2,
    borderRadius: theme.borderRadius.sm,
  },
  checkboxInner: {
    borderRadius: 2,
  },
  checkboxText: {
    fontSize: theme.typography.fontSizes.base,
    fontFamily: theme.typography.fontFamilies.nunito,
    color: theme.colors.typography,
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemText: {
    lineHeight: 24,
    color: theme.colors.typography,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  placeholderText: {
    lineHeight: 24,
    fontStyle: 'italic',
  },
}));
