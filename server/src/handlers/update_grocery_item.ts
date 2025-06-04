
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type UpdateGroceryItemInput, type GroceryItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateGroceryItem = async (input: UpdateGroceryItemInput): Promise<GroceryItem> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof groceryItemsTable.$inferInsert> = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.category_id !== undefined) {
      updateData.category_id = input.category_id;
    }
    
    if (input.purchased !== undefined) {
      updateData.purchased = input.purchased;
    }

    // Update the grocery item
    const result = await db.update(groceryItemsTable)
      .set(updateData)
      .where(eq(groceryItemsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Grocery item with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Grocery item update failed:', error);
    throw error;
  }
};
