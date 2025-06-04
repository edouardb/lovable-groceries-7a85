
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type UpdateCategoryInput, type Category } from '../schema';
import { eq } from 'drizzle-orm';

export const updateCategory = async (input: UpdateCategoryInput): Promise<Category> => {
  try {
    // Update category record
    const result = await db.update(categoriesTable)
      .set({
        name: input.name
      })
      .where(eq(categoriesTable.id, input.id))
      .returning()
      .execute();

    // Check if category was found and updated
    if (result.length === 0) {
      throw new Error(`Category with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Category update failed:', error);
    throw error;
  }
};
