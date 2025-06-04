
import { z } from 'zod';

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

// Input schema for creating categories
export const createCategoryInputSchema = z.object({
  name: z.string().min(1).max(50)
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

// Input schema for updating categories
export const updateCategoryInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(50)
});

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

// GroceryItem schema
export const groceryItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  category_id: z.number(),
  purchased: z.boolean(),
  created_at: z.coerce.date()
});

export type GroceryItem = z.infer<typeof groceryItemSchema>;

// Input schema for creating grocery items
export const createGroceryItemInputSchema = z.object({
  name: z.string().min(1).max(100),
  category_id: z.number()
});

export type CreateGroceryItemInput = z.infer<typeof createGroceryItemInputSchema>;

// Input schema for updating grocery items
export const updateGroceryItemInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100).optional(),
  category_id: z.number().optional(),
  purchased: z.boolean().optional()
});

export type UpdateGroceryItemInput = z.infer<typeof updateGroceryItemInputSchema>;

// Delete input schema
export const deleteInputSchema = z.object({
  id: z.number()
});

export type DeleteInput = z.infer<typeof deleteInputSchema>;

// Get grocery item by ID schema
export const getByIdInputSchema = z.object({
  id: z.number()
});

export type GetByIdInput = z.infer<typeof getByIdInputSchema>;
