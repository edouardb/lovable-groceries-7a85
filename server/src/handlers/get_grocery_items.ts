
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type GroceryItem } from '../schema';

export const getGroceryItems = async (): Promise<GroceryItem[]> => {
  try {
    const result = await db.select()
      .from(groceryItemsTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Get grocery items failed:', error);
    throw error;
  }
};
