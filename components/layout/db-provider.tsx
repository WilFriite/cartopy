import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { Suspense, type PropsWithChildren } from 'react';
import { ActivityIndicator } from 'react-native';
import * as schema from '~/db/schema';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { createContext, useMemo } from 'react';
import { migrateAsync } from '~/utils/migrate';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

const DB_NAME = 'cartopy.db';

export type DrizzleContextType = ReturnType<typeof drizzle<typeof schema>>;

export const DrizzleContext = createContext<DrizzleContextType | null>(null);

export const DrizzleContextProvider = ({ children }: { children: React.ReactNode }) => {
  const db = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);
  useDrizzleStudio(db);

  return <DrizzleContext value={drizzleDb}>{children}</DrizzleContext>;
};

export function DbProvider({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DB_NAME}
        options={{ enableChangeListener: true }}
        onInit={migrateAsync}
        useSuspense>
        <DrizzleContextProvider>{children}</DrizzleContextProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
