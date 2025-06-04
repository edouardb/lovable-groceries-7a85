
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, groceryItemsTable } from '../db/schema';
import { type UpdateGroceryItemInput, type CreateCategoryInput } from '../schema';
import { updateGroceryItem } from '../handlers/update_grocery_item';
import { eq } from 'drizzle-orm';

// Test data
const testCategory: CreateCategoryInput = {
  name: 'Test Category'
};

const secondCategory: CreateCategoryInput = {
  name: 'Second Category'
};

describe('updateGroceryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update grocery item name', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const category = categoryResult[0];

    // Create grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Original Item',
        category_id: category.id
      })
      .returning()
      .execute();
    const item = itemResult[0];

    // Update only the name
    const updateInput: UpdateGroceryItemInput = {
      id: item.id,
      name: 'Updated Item Name'
    };

    const result = await updateGroceryItem(updateInput);

    expect(result.id).toEqual(item.id);
    expect(result.name).toEqual('Updated Item Name');
    expect(result.category_id).toEqual(category.id);
    expect(result.purchased).toEqual(false); // Should remain unchanged
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update grocery item category', async () => {
    // Create two categories
    const firstCategoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const firstCategory = firstCategoryResult[0];

    const secondCategoryResult = await db.insert(categoriesTable)
      .values(secondCategory)
      .returning()
      .execute();
    const secondCategoryObj = secondCategoryResult[0];

    // Create grocery item with first category
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Test Item',
        category_id: firstCategory.id
      })
      .returning()
      .execute();
    const item = itemResult[0];

    // Update category
    const updateInput: UpdateGroceryItemInput = {
      id: item.id,
      category_id: secondCategoryObj.id
    };

    const result = await updateGroceryItem(updateInput);

    expect(result.id).toEqual(item.id);
    expect(result.name).toEqual('Test Item'); // Should remain unchanged
    expect(result.category_id).toEqual(secondCategoryObj.id);
    expect(result.purchased).toEqual(false);
  });

  it('should update grocery item purchased status', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const category = categoryResult[0];

    // Create grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Test Item',
        category_id: category.id
      })
      .returning()
      .execute();
    const item = itemResult[0];

    // Update purchased status
    const updateInput: UpdateGroceryItemInput = {
      id: item.id,
      purchased: true
    };

    const result = await updateGroceryItem(updateInput);

    expect(result.id).toEqual(item.id);
    expect(result.name).toEqual('Test Item');
    expect(result.category_id).toEqual(category.id);
    expect(result.purchased).toEqual(true);
  });

  it('should update multiple fields at once', async () => {
    // Create two categories
    const firstCategoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const firstCategory = firstCategoryResult[0];

    const secondCategoryResult = await db.insert(categoriesTable)
      .values(secondCategory)
      .returning()
      .execute();
    const secondCategoryObj = secondCategoryResult[0];

    // Create grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Original Item',
        category_id: firstCategory.id
      })
      .returning()
      .execute();
    const item = itemResult[0];

    // Update multiple fields
    const updateInput: UpdateGroceryItemInput = {
      id: item.id,
      name: 'Updated Item',
      category_id: secondCategoryObj.id,
      purchased: true
    };

    const result = await updateGroceryItem(updateInput);

    expect(result.id).toEqual(item.id);
    expect(result.name).toEqual('Updated Item');
    expect(result.category_id).toEqual(secondCategoryObj.id);
    expect(result.purchased).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const category = categoryResult[0];

    // Create grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Original Item',
        category_id: category.id
      })
      .returning()
      .execute();
    const item = itemResult[0];

    // Update item
    const updateInput: UpdateGroceryItemInput = {
      id: item.id,
      name: 'Updated Item',
      purchased: true
    };

    await updateGroceryItem(updateInput);

    // Verify changes in database
    const updatedItems = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, item.id))
      .execute();

    expect(updatedItems).toHaveLength(1);
    expect(updatedItems[0].name).toEqual('Updated Item');
    expect(updatedItems[0].purchased).toEqual(true);
    expect(updatedItems[0].category_id).toEqual(category.id);
  });

  it('should throw error for non-existent grocery item', async () => {
    const updateInput: UpdateGroceryItemInput = {
      id: 99999,
      name: 'Updated Item'
    };

    expect(updateGroceryItem(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should throw error for invalid category_id', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const category = categoryResult[0];

    // Create grocery item
    const itemResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Test Item',
        category_id: category.id
      })
      .returning()
      .execute();
    const item = itemResult[0];

    // Try to update with invalid category_id
    const updateInput: UpdateGroceryItemInput = {
      id: item.id,
      category_id: 99999
    };

    expect(updateGroceryItem(updateInput)).rejects.toThrow(/foreign key constraint/i);
  });
});
