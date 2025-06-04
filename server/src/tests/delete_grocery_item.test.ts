
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, groceryItemsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { deleteGroceryItem } from '../handlers/delete_grocery_item';
import { eq } from 'drizzle-orm';

describe('deleteGroceryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a grocery item', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category'
      })
      .returning()
      .execute();

    const category = categoryResult[0];

    // Create a grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Test Item',
        category_id: category.id
      })
      .returning()
      .execute();

    const item = itemResult[0];

    const input: DeleteInput = {
      id: item.id
    };

    const result = await deleteGroceryItem(input);

    expect(result.success).toBe(true);

    // Verify item was deleted from database
    const items = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, item.id))
      .execute();

    expect(items).toHaveLength(0);
  });

  it('should handle deletion of non-existent item', async () => {
    const input: DeleteInput = {
      id: 999999
    };

    const result = await deleteGroceryItem(input);

    expect(result.success).toBe(true);
  });

  it('should not affect other grocery items', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category'
      })
      .returning()
      .execute();

    const category = categoryResult[0];

    // Create two grocery items
    const item1Result = await db.insert(groceryItemsTable)
      .values({
        name: 'Item 1',
        category_id: category.id
      })
      .returning()
      .execute();

    const item2Result = await db.insert(groceryItemsTable)
      .values({
        name: 'Item 2',
        category_id: category.id
      })
      .returning()
      .execute();

    const item1 = item1Result[0];
    const item2 = item2Result[0];

    // Delete first item
    const input: DeleteInput = {
      id: item1.id
    };

    await deleteGroceryItem(input);

    // Verify first item was deleted
    const deletedItems = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, item1.id))
      .execute();

    expect(deletedItems).toHaveLength(0);

    // Verify second item still exists
    const remainingItems = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, item2.id))
      .execute();

    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].name).toEqual('Item 2');
  });
});
