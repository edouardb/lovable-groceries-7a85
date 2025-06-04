
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, groceryItemsTable } from '../db/schema';
import { type GetByIdInput } from '../schema';
import { getGroceryItemById } from '../handlers/get_grocery_item_by_id';

describe('getGroceryItemById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return grocery item by id', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create a grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Test Item',
        category_id: categoryId,
        purchased: false
      })
      .returning()
      .execute();

    const itemId = itemResult[0].id;

    // Test the handler
    const input: GetByIdInput = { id: itemId };
    const result = await getGroceryItemById(input);

    expect(result.id).toEqual(itemId);
    expect(result.name).toEqual('Test Item');
    expect(result.category_id).toEqual(categoryId);
    expect(result.purchased).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when grocery item not found', async () => {
    const input: GetByIdInput = { id: 999 };

    expect(getGroceryItemById(input)).rejects.toThrow(/grocery item with id 999 not found/i);
  });

  it('should return purchased grocery item correctly', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create a purchased grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Purchased Item',
        category_id: categoryId,
        purchased: true
      })
      .returning()
      .execute();

    const itemId = itemResult[0].id;

    // Test the handler
    const input: GetByIdInput = { id: itemId };
    const result = await getGroceryItemById(input);

    expect(result.id).toEqual(itemId);
    expect(result.name).toEqual('Purchased Item');
    expect(result.category_id).toEqual(categoryId);
    expect(result.purchased).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });
});
