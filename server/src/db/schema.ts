
import { serial, text, pgTable, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const groceryItemsTable = pgTable('grocery_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category_id: integer('category_id').notNull().references(() => categoriesTable.id),
  purchased: boolean('purchased').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  groceryItems: many(groceryItemsTable),
}));

export const groceryItemsRelations = relations(groceryItemsTable, ({ one }) => ({
  category: one(categoriesTable, {
    fields: [groceryItemsTable.category_id],
    references: [categoriesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type GroceryItem = typeof groceryItemsTable.$inferSelect;
export type NewGroceryItem = typeof groceryItemsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  categories: categoriesTable, 
  groceryItems: groceryItemsTable 
};
