import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';
import { Alert, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Button, ButtonIcon, ButtonText } from '~/components/ui/btn';
import { Card } from '~/components/ui/card';
import { Image } from 'expo-image';
import { Container } from '~/components/ui/container';
import { HStack } from '~/components/ui/stack';
import { SwipeableView } from '~/components/ui/swipeable-view';
import { Text } from '~/components/ui/typography';
import { lists, ListSelectType } from '~/db/schema';
import { useDrizzle } from '~/hooks/use-drizzle';
import { formatListItems } from '~/utils/format';
import { Link, router } from 'expo-router';
import { Eye, PlusCircle, Trash } from 'lucide-react-native';
import { eq } from 'drizzle-orm';
import { useMutation } from '@tanstack/react-query';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DisplayListsPage() {
  const db = useDrizzle();
  const { data } = useLiveQuery(db.select().from(lists));

  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      return db.delete(lists).where(eq(lists.id, id)).run();
    },
    onSuccess: () => {
      Alert.alert('Succès', 'Liste supprimée avec succès');
      router.replace('/lists');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Erreur lors de la suppression de la liste');
      console.error('Delete list error:', error);
    },
  });

  const handleDeleteList = (list: ListSelectType) => {
    Alert.alert(
      `Supprimer la liste "${list.name}"`,
      'Cette action est irréversible. Êtes-vous sûr de vouloir supprimer la liste ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteListMutation.mutate(list.id),
        },
      ]
    );
  };

  const renderItem = useCallback((item: ListSelectType) => {
    return (
      <SwipeableView
        style={styles.swipeable}
        hiddenPan={
          <View>
            <HStack style={styles.buttonGroup} gap="none">
              <Button
                action="destructive"
                style={styles.buttonItem}
                onPress={() => handleDeleteList(item)}>
                <ButtonIcon as={Trash} />
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
                  <ButtonIcon as={Eye} />
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
    <Container>
      <Text size="xl" align="center">
        Mes Listes
      </Text>
      {data.length > 0 ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <FlatList
            contentContainerStyle={styles.listContainer}
            style={{ flex: 1 }}
            data={data}
            numColumns={1}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderItem(item)}
          />
        </GestureHandlerRootView>
      ) : (
        <View style={styles.emptyList}>
          <Text size="lg">Aucune liste n&apos;existe pour le moment. 😕</Text>
          <Image
            transition={1000}
            source={require('~/assets/images/lost.gif')}
            style={styles.emptyListImage}
          />
          <Link href="/lists/create" asChild>
            <Button>
              <ButtonIcon as={PlusCircle} />
              <ButtonText>Ajouter une liste</ButtonText>
            </Button>
          </Link>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  swipeable: {
    width: '100%',
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
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
    width: '100%',
    borderRadius: theme.borderRadius.none,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyListImage: {
    width: '100%',
    height: 400,
    borderRadius: theme.borderRadius.xl,
    alignSelf: 'center',
  },
}));
