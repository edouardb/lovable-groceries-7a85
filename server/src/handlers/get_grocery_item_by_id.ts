
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type GetByIdInput, type GroceryItem } from '../schema';
import { eq } from 'drizzle-orm';

export const getGroceryItemById = async (input: GetByIdInput): Promise<GroceryItem> => {
  try {
    const result = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error(`Grocery item with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get grocery item by id:', error);
    throw error;
  }
};
