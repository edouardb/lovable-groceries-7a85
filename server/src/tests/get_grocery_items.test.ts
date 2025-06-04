
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, groceryItemsTable } from '../db/schema';
import { getGroceryItems } from '../handlers/get_grocery_items';

describe('getGroceryItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no grocery items exist', async () => {
    const result = await getGroceryItems();
    expect(result).toHaveLength(0);
  });

  it('should return all grocery items', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create test grocery items
    await db.insert(groceryItemsTable)
      .values([
        { name: 'Apples', category_id: categoryId, purchased: false },
        { name: 'Bananas', category_id: categoryId, purchased: true },
        { name: 'Milk', category_id: categoryId, purchased: false }
      ])
      .execute();

    const result = await getGroceryItems();

    expect(result).toHaveLength(3);
    
    // Verify each item has the correct structure
    result.forEach(item => {
      expect(item.id).toBeDefined();
      expect(typeof item.name).toBe('string');
      expect(typeof item.category_id).toBe('number');
      expect(typeof item.purchased).toBe('boolean');
      expect(item.created_at).toBeInstanceOf(Date);
    });

    // Verify specific items exist
    const itemNames = result.map(item => item.name);
    expect(itemNames).toContain('Apples');
    expect(itemNames).toContain('Bananas');
    expect(itemNames).toContain('Milk');
  });

  it('should return items with correct boolean values', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create items with different purchased states
    await db.insert(groceryItemsTable)
      .values([
        { name: 'Purchased Item', category_id: categoryId, purchased: true },
        { name: 'Unpurchased Item', category_id: categoryId, purchased: false }
      ])
      .execute();

    const result = await getGroceryItems();

    expect(result).toHaveLength(2);
    
    const purchasedItem = result.find(item => item.name === 'Purchased Item');
    const unpurchasedItem = result.find(item => item.name === 'Unpurchased Item');

    expect(purchasedItem?.purchased).toBe(true);
    expect(unpurchasedItem?.purchased).toBe(false);
  });
});
