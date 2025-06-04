
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, groceryItemsTable } from '../db/schema';
import { type CreateGroceryItemInput } from '../schema';
import { createGroceryItem } from '../handlers/create_grocery_item';
import { eq } from 'drizzle-orm';

describe('createGroceryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testCategoryId: number;

  beforeEach(async () => {
    // Create a test category for the grocery items
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category'
      })
      .returning()
      .execute();
    testCategoryId = categoryResult[0].id;
  });

  it('should create a grocery item', async () => {
    const testInput: CreateGroceryItemInput = {
      name: 'Test Grocery Item',
      category_id: testCategoryId
    };

    const result = await createGroceryItem(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Grocery Item');
    expect(result.category_id).toEqual(testCategoryId);
    expect(result.purchased).toEqual(false); // Default value
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save grocery item to database', async () => {
    const testInput: CreateGroceryItemInput = {
      name: 'Test Grocery Item',
      category_id: testCategoryId
    };

    const result = await createGroceryItem(testInput);

    // Query using proper drizzle syntax
    const groceryItems = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, result.id))
      .execute();

    expect(groceryItems).toHaveLength(1);
    expect(groceryItems[0].name).toEqual('Test Grocery Item');
    expect(groceryItems[0].category_id).toEqual(testCategoryId);
    expect(groceryItems[0].purchased).toEqual(false);
    expect(groceryItems[0].created_at).toBeInstanceOf(Date);
  });

  it('should reject invalid category_id', async () => {
    const testInput: CreateGroceryItemInput = {
      name: 'Test Grocery Item',
      category_id: 999999 // Non-existent category
    };

    await expect(createGroceryItem(testInput)).rejects.toThrow(/foreign key constraint/i);
  });
});
