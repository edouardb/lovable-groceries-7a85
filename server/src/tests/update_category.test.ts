
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type UpdateCategoryInput, type CreateCategoryInput } from '../schema';
import { updateCategory } from '../handlers/update_category';
import { eq } from 'drizzle-orm';

describe('updateCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a category', async () => {
    // Create a category first directly in database
    const createResult = await db.insert(categoriesTable)
      .values({
        name: 'Original Category'
      })
      .returning()
      .execute();
    
    const createdCategory = createResult[0];

    // Update the category
    const updateInput: UpdateCategoryInput = {
      id: createdCategory.id,
      name: 'Updated Category'
    };
    const result = await updateCategory(updateInput);

    // Verify the update
    expect(result.id).toEqual(createdCategory.id);
    expect(result.name).toEqual('Updated Category');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated category to database', async () => {
    // Create a category first directly in database
    const createResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category'
      })
      .returning()
      .execute();
    
    const createdCategory = createResult[0];

    // Update the category
    const updateInput: UpdateCategoryInput = {
      id: createdCategory.id,
      name: 'Modified Category'
    };
    await updateCategory(updateInput);

    // Query database to verify update
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, createdCategory.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Modified Category');
    expect(categories[0].id).toEqual(createdCategory.id);
  });

  it('should throw error when category does not exist', async () => {
    const updateInput: UpdateCategoryInput = {
      id: 999, // Non-existent ID
      name: 'Should Not Work'
    };

    await expect(updateCategory(updateInput)).rejects.toThrow(/Category with id 999 not found/i);
  });
});
