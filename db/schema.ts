import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { DateTime } from 'luxon';

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  items: text('items').default(sql`''`),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => DateTime.now().toISO()),
  lastPerformedAt: text('last_performed_at').default(sql`NULL`),
});

export type ListSelectType = typeof lists.$inferSelect;
export type ListInsertType = typeof lists.$inferInsert;
