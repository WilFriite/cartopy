import { use } from 'react';
import { DrizzleContextType, DrizzleContext } from '~/components/layout/db-provider';

export function useDrizzle(): DrizzleContextType {
  const drizzleDb = use(DrizzleContext);
  if (!drizzleDb) {
    throw new Error('Unexpected error: null drizzleDb');
  }
  return drizzleDb;
}
