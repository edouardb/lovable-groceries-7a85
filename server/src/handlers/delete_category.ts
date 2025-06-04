
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteCategory = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(categoriesTable)
      .where(eq(categoriesTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Category deletion failed:', error);
    throw error;
  }
};
