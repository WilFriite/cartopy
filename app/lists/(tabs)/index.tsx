import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useMemo } from 'react';
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
import { Link, router, useRouter } from 'expo-router';
import { Eye, Plus, PlusCircle, Trash } from 'lucide-react-native';
import { eq } from 'drizzle-orm';
import { useMutation } from '@tanstack/react-query';
import { FlatList } from 'react-native-gesture-handler';
import {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Transition, { useScreenAnimation } from 'react-native-screen-transitions';
import { Icon } from '~/components/ui/icon';

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
        <FlatList
          contentContainerStyle={styles.listContainer}
          style={{ flex: 1 }}
          data={data}
          numColumns={1}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderItem(item)}
        />
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
      <AddListButton />
    </Container>
  );
}

function AddListButton() {
  const screenProps = useScreenAnimation();
  const scale = useSharedValue(1);
  const router = useRouter();

  const boundId = 'add-list';

  const animatedContainerStyle = useAnimatedStyle(() => {
    'worklet';

    if (screenProps.value.activeBoundId === boundId) return {};

    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });

  useAnimatedReaction(
    () => screenProps.value,
    (props) => {
      const forRoute = 'create2';
      console.log('props1', props.next?.route.name);
      if (props.next?.route.name !== forRoute) return;
      console.log('props2');
      if (props.next?.closing === undefined) {
        console.log('undefined');
        scale.value = withSpring(1);
        return;
      }
      if (props.next.closing === 0) {
        console.log('closing 0');
        scale.value = withTiming(0, {
          duration: 1000,
          easing: Easing.bezierFn(0.19, 1, 0.22, 1),
        });
      } else if (props.next.closing === 1) {
        console.log('closing 1');
        scale.value = withTiming(1, {
          duration: 1000,
          easing: Easing.bezierFn(0.19, 1, 0.22, 1),
        });
      }
    }
  );

  const onPress = () => {
    console.log('onPress');
    router.push({
      pathname: '/lists/(tabs)/create2',
      params: {
        sharedBoundTag: boundId,
      },
    });
  };
  return (
    <Transition.Pressable
      sharedBoundTag={boundId}
      onPress={onPress}
      style={[styles.button, animatedContainerStyle]}>
      <Icon as={Plus} size={20} color="white" />
    </Transition.Pressable>
  );
  return (
    <Link href="/lists/create2" asChild>
      {/* <Transition.Pressable
        sharedBoundTag={boundId}
        onPress={onPress}
        style={[animatedContainerStyle, styles.button]}
      > */}
      <Button style={styles.button}>
        <ButtonIcon as={Plus} />
      </Button>
      {/* <Icon as={Plus} size={30} color="white" /> */}
      {/* </Transition.Pressable> */}
    </Link>
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
  button: {
    height: 60,
    aspectRatio: 1,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.astral,
  },
}));
