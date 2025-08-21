import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';
import { Button, ButtonIcon, ButtonText } from '~/components/ui/btn';
import { Card } from '~/components/ui/card';

import { Container } from '~/components/ui/container';
import { HStack } from '~/components/ui/stack';
import { SwipeableView } from '~/components/ui/swipeable-view';
import { Text } from '~/components/ui/typography';
import { lists, ListSelectType } from '~/db/schema';
import { useDrizzle } from '~/hooks/use-drizzle';
import { formatListItems } from '~/utils/format';
import Animated from 'react-native-reanimated';
import { Link } from 'expo-router';

export default function DisplayListsPage() {
  const db = useDrizzle();
  const { data } = useLiveQuery(db.select().from(lists));

  const renderItem = useCallback((item: ListSelectType) => {
    return (
      <SwipeableView
        style={styles.swipeable}
        hiddenPan={
          <View>
            <HStack style={styles.buttonGroup} gap="none">
              <Button action="destructive" style={styles.buttonItem}>
                <ButtonIcon name="trash" />
              </Button>
              <Link
                href={{
                  pathname: '/lists/[id]',
                  params: {
                    id: item.id.toString(),
                  },
                }}
                asChild>
                <Button style={styles.buttonItem}>
                  <ButtonIcon name="eye" />
                </Button>
              </Link>
            </HStack>
          </View>
        }>
        <Card padding="lg" style={styles.card}>
          <Card.Header>
            <Card.Title>{item.name}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Text>{formatListItems(item.items)?.length} items</Text>
          </Card.Body>
        </Card>
      </SwipeableView>
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Container>
        <Text size="xl" align="center">
          Mes Listes
        </Text>
        {data.length > 0 ? (
          <Animated.ScrollView style={{ flex: 1, height: '100%' }}>
            <FlatList
              data={data}
              numColumns={1}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderItem(item)}
            />
          </Animated.ScrollView>
        ) : (
          <View style={styles.emptyList}>
            <Text size="lg">Aucune liste n&apos;existe pour le moment. 😕</Text>
            <Link href="/lists/create" asChild>
              <Button>
                <ButtonIcon name="plus" />
                <ButtonText>Ajouter une liste</ButtonText>
              </Button>
            </Link>
          </View>
        )}
      </Container>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create((theme) => ({
  swipeable: {
    borderRadius: theme.borderRadius.xl,
    marginVertical: theme.spacing.md,
    shadowColor: theme.shadows.hard[1],
    shadowOffset: {
      height: 2,
      width: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGroup: {
    width: '100%',
    height: '100%',
  },
  buttonItem: {
    width: '50%',
    height: '100%',
    borderRadius: 0,
  },
  card: {
    marginVertical: 0,
    borderRadius: theme.borderRadius.none,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
}));
