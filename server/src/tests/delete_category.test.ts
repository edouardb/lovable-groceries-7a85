
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type DeleteInput, type CreateCategoryInput } from '../schema';
import { deleteCategory } from '../handlers/delete_category';
import { eq } from 'drizzle-orm';

const testInput: CreateCategoryInput = {
  name: 'Test Category'
};

const createCategory = async (input: CreateCategoryInput) => {
  const result = await db.insert(categoriesTable)
    .values({
      name: input.name
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('deleteCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a category', async () => {
    // Create test category first
    const category = await createCategory(testInput);
    
    const deleteInput: DeleteInput = {
      id: category.id
    };

    const result = await deleteCategory(deleteInput);

    expect(result.success).toBe(true);
  });

  it('should remove category from database', async () => {
    // Create test category first
    const category = await createCategory(testInput);
    
    const deleteInput: DeleteInput = {
      id: category.id
    };

    await deleteCategory(deleteInput);

    // Verify category is deleted
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, category.id))
      .execute();

    expect(categories).toHaveLength(0);
  });

  it('should succeed even when category does not exist', async () => {
    const deleteInput: DeleteInput = {
      id: 999 // Non-existent ID
    };

    const result = await deleteCategory(deleteInput);

    expect(result.success).toBe(true);
  });

  it('should not affect other categories', async () => {
    // Create multiple categories
    const category1 = await createCategory({ name: 'Category 1' });
    const category2 = await createCategory({ name: 'Category 2' });
    
    const deleteInput: DeleteInput = {
      id: category1.id
    };

    await deleteCategory(deleteInput);

    // Verify only the targeted category is deleted
    const remainingCategories = await db.select()
      .from(categoriesTable)
      .execute();

    expect(remainingCategories).toHaveLength(1);
    expect(remainingCategories[0].id).toEqual(category2.id);
    expect(remainingCategories[0].name).toEqual('Category 2');
  });
});
