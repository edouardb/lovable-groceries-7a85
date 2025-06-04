
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type GetByIdInput } from '../schema';
import { getCategoryById } from '../handlers/get_category_by_id';

describe('getCategoryById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return category by id', async () => {
    // Create test category
    const insertResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category'
      })
      .returning()
      .execute();

    const categoryId = insertResult[0].id;

    const input: GetByIdInput = {
      id: categoryId
    };

    const result = await getCategoryById(input);

    expect(result.id).toEqual(categoryId);
    expect(result.name).toEqual('Test Category');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when category not found', async () => {
    const input: GetByIdInput = {
      id: 999
    };

    expect(getCategoryById(input)).rejects.toThrow(/not found/i);
  });

  it('should return correct category when multiple categories exist', async () => {
    // Create multiple test categories
    const insertResults = await db.insert(categoriesTable)
      .values([
        { name: 'Category A' },
        { name: 'Category B' },
        { name: 'Category C' }
      ])
      .returning()
      .execute();

    const targetCategoryId = insertResults[1].id; // Get middle category

    const input: GetByIdInput = {
      id: targetCategoryId
    };

    const result = await getCategoryById(input);

    expect(result.id).toEqual(targetCategoryId);
    expect(result.name).toEqual('Category B');
    expect(result.created_at).toBeInstanceOf(Date);
  });
});
