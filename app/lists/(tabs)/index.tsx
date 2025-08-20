import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button, ButtonIcon, ButtonText } from '~/components/ui/btn';
import { Card } from '~/components/ui/card';

import { Container } from '~/components/ui/container';
import { Text } from '~/components/ui/typography';
import { lists, ListSelectType } from '~/db/schema';
import { useDrizzle } from '~/hooks/use-drizzle';
import { formatListItems } from '~/utils/format';

export default function DisplayListsPage() {
  const db = useDrizzle();
  const { data } = useLiveQuery(db.select().from(lists));

  const renderItem = useCallback((item: ListSelectType) => {
    return (
      <Card padding="lg">
        <Card.Header>
          <Card.Title>{item.name}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Text>{formatListItems(item.items)?.length} items</Text>
        </Card.Body>
        <Card.Footer>
          <Button variant="outline">
            <ButtonText>Voir plus</ButtonText>
            <ButtonIcon name="arrow-right" />
          </Button>
        </Card.Footer>
      </Card>
    );
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Container>
        <Text size="xl" align="center">
          Mes Listes
        </Text>
        <Text size="lg">{data?.length} listes.</Text>
        <FlatList
          data={data}
          numColumns={1}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderItem(item)}
        />
      </Container>
    </GestureHandlerRootView>
  );
}
