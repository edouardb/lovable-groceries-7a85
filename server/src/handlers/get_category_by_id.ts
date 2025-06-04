
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type GetByIdInput, type Category } from '../schema';
import { eq } from 'drizzle-orm';

export const getCategoryById = async (input: GetByIdInput): Promise<Category> => {
  try {
    const result = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error(`Category with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get category by id:', error);
    throw error;
  }
};
