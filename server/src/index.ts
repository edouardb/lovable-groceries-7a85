
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createCategoryInputSchema, 
  updateCategoryInputSchema,
  deleteInputSchema,
  getByIdInputSchema,
  createGroceryItemInputSchema,
  updateGroceryItemInputSchema
} from './schema';
import { createCategory } from './handlers/create_category';
import { getCategories } from './handlers/get_categories';
import { getCategoryById } from './handlers/get_category_by_id';
import { updateCategory } from './handlers/update_category';
import { deleteCategory } from './handlers/delete_category';
import { createGroceryItem } from './handlers/create_grocery_item';
import { getGroceryItems } from './handlers/get_grocery_items';
import { getGroceryItemById } from './handlers/get_grocery_item_by_id';
import { updateGroceryItem } from './handlers/update_grocery_item';
import { deleteGroceryItem } from './handlers/delete_grocery_item';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Category routes
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),
  getCategories: publicProcedure
    .query(() => getCategories()),
  getCategoryById: publicProcedure
    .input(getByIdInputSchema)
    .query(({ input }) => getCategoryById(input)),
  updateCategory: publicProcedure
    .input(updateCategoryInputSchema)
    .mutation(({ input }) => updateCategory(input)),
  deleteCategory: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteCategory(input)),
    
  // Grocery item routes
  createGroceryItem: publicProcedure
    .input(createGroceryItemInputSchema)
    .mutation(({ input }) => createGroceryItem(input)),
  getGroceryItems: publicProcedure
    .query(() => getGroceryItems()),
  getGroceryItemById: publicProcedure
    .input(getByIdInputSchema)
    .query(({ input }) => getGroceryItemById(input)),
  updateGroceryItem: publicProcedure
    .input(updateGroceryItemInputSchema)
    .mutation(({ input }) => updateGroceryItem(input)),
  deleteGroceryItem: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteGroceryItem(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
