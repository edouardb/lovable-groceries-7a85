
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { getCategories } from '../handlers/get_categories';

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();

    expect(result).toEqual([]);
  });

  it('should return all categories', async () => {
    // Create test categories
    await db.insert(categoriesTable)
      .values([
        { name: 'Fruits' },
        { name: 'Vegetables' },
        { name: 'Dairy' }
      ])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Fruits');
    expect(result[1].name).toEqual('Vegetables');
    expect(result[2].name).toEqual('Dairy');

    // Verify all required fields are present
    result.forEach(category => {
      expect(category.id).toBeDefined();
      expect(typeof category.id).toBe('number');
      expect(category.name).toBeDefined();
      expect(typeof category.name).toBe('string');
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return categories in creation order', async () => {
    // Create categories with slight delay to ensure different timestamps
    await db.insert(categoriesTable)
      .values({ name: 'First Category' })
      .execute();

    await db.insert(categoriesTable)
      .values({ name: 'Second Category' })
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Category');
    expect(result[1].name).toEqual('Second Category');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
