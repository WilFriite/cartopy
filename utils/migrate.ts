import * as schema from '~/db/schema';
import migrations from '~/drizzle/migrations';
import { count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteDatabase } from 'expo-sqlite';

/**
 * A drizzle migration helper for SQLiteProvider.onInit
 */
export async function migrateAsync(db: SQLiteDatabase) {
  // We create a dedicated drizzle instance for migrations,
  // because in SQLiteProvider.onInit state,
  // useSQLiteContext() is not available yet.
  const drizzleDb = drizzle(db, { schema });
  await migrate(drizzleDb, migrations);

  const listsCount = (await drizzleDb.select({ count: count() }).from(schema.lists))[0];

  if (listsCount.count <= 0) {
    await drizzleDb.insert(schema.lists).values({
      name: 'Liste par défaut',
    });
  }
}
