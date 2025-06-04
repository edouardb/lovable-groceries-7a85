
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateCategoryInput = {
  name: 'Fruits'
};

describe('createCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a category', async () => {
    const result = await createCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Fruits');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save category to database', async () => {
    const result = await createCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Fruits');
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different category names', async () => {
    const vegetablesInput: CreateCategoryInput = {
      name: 'Vegetables'
    };

    const result = await createCategory(vegetablesInput);

    expect(result.name).toEqual('Vegetables');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify it's saved in database
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.name, 'Vegetables'))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Vegetables');
  });
});
