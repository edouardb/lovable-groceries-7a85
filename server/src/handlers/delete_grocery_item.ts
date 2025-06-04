
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteGroceryItem = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(groceryItemsTable)
      .where(eq(groceryItemsTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Grocery item deletion failed:', error);
    throw error;
  }
};
