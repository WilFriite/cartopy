import { useEffect } from 'react';
import { type RouterAction, useQuickActionRouting } from 'expo-quick-actions/router';
import * as QuickActions from 'expo-quick-actions';
import { Platform } from 'react-native';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useDrizzle } from '~/hooks/use-drizzle';

export function QuickActionSetup() {
  useQuickActionRouting();
  const db = useDrizzle();
  const { data: lists } = useLiveQuery(
    db.query.lists.findMany({
      limit: 2,
      orderBy: (lists, { desc }) => desc(lists.lastPerformedAt),
      columns: {
        id: true,
        name: true,
      },
    }),
    []
  );

  useEffect(() => {
    QuickActions.setItems<RouterAction>([
      {
        title: 'Créer une nouvelle liste',
        icon: Platform.OS === 'ios' ? 'add' : undefined,
        id: 'create-list',
        params: { href: '/lists/create' },
      },
      ...lists?.map((list) => ({
        title: list.name,
        icon: Platform.OS === 'ios' ? 'symbol:eye' : undefined,
        id: `list-details-${list.id.toString()}`,
        params: { href: `/lists/${list.id}` },
      })),
    ]);
  }, [lists]);

  return null;
}
