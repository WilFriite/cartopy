import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  items: text('items').default(sql`''`),
  isTemporary: integer('is_temporary', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastPerformedAt: text('last_performed_at').default(sql`NULL`),
});

export type ListSelectType = typeof lists.$inferSelect;
export type ListInsertType = typeof lists.$inferInsert;
