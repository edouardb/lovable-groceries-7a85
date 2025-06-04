
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { GroceryItem, Category, CreateGroceryItemInput, CreateCategoryInput } from '../../server/src/schema';

function App() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('shopping');

  // Form states
  const [itemFormData, setItemFormData] = useState<CreateGroceryItemInput>({
    name: '',
    category_id: 0
  });
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryInput>({
    name: ''
  });

  const loadData = useCallback(async () => {
    try {
      const [itemsResult, categoriesResult] = await Promise.all([
        trpc.getGroceryItems.query(),
        trpc.getCategories.query()
      ]);
      setGroceryItems(itemsResult);
      setCategories(categoriesResult);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name.trim() || !itemFormData.category_id) return;

    setIsLoading(true);
    try {
      const newItem = await trpc.createGroceryItem.mutate(itemFormData);
      setGroceryItems((prev: GroceryItem[]) => [...prev, newItem]);
      setItemFormData({ name: '', category_id: 0 });
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    setIsLoading(true);
    try {
      const newCategory = await trpc.createCategory.mutate(categoryFormData);
      setCategories((prev: Category[]) => [...prev, newCategory]);
      setCategoryFormData({ name: '' });
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePurchased = async (item: GroceryItem) => {
    try {
      await trpc.updateGroceryItem.mutate({
        id: item.id,
        purchased: !item.purchased
      });
      setGroceryItems((prev: GroceryItem[]) =>
        prev.map((prevItem: GroceryItem) =>
          prevItem.id === item.id ? { ...prevItem, purchased: !prevItem.purchased } : prevItem
        )
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await trpc.deleteGroceryItem.mutate({ id: itemId });
      setGroceryItems((prev: GroceryItem[]) =>
        prev.filter((item: GroceryItem) => item.id !== itemId)
      );
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await trpc.deleteCategory.mutate({ id: categoryId });
      setCategories((prev: Category[]) =>
        prev.filter((category: Category) => category.id !== categoryId)
      );
      // Also remove items from this category
      setGroceryItems((prev: GroceryItem[]) =>
        prev.filter((item: GroceryItem) => item.category_id !== categoryId)
      );
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const unpurchasedItems = groceryItems.filter((item: GroceryItem) => !item.purchased);
  const purchasedItems = groceryItems.filter((item: GroceryItem) => item.purchased);

  const groupedItems = unpurchasedItems.reduce((acc, item: GroceryItem) => {
    const categoryName = getCategoryName(item.category_id);
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-purple-800">🛒 Lovable Groceries</h1>
          <p className="text-purple-600">Your smart shopping companion</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="shopping" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              🛍️ Shopping
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              ⚙️ Manage
            </TabsTrigger>
          </TabsList>

          {/* Shopping Tab */}
          <TabsContent value="shopping" className="space-y-4">
            {/* Add Item Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-800">Add New Item</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <Input
                    placeholder="Enter item name..."
                    value={itemFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setItemFormData((prev: CreateGroceryItemInput) => ({ ...prev, name: e.target.value }))
                    }
                    className="border-purple-200 focus:border-purple-400"
                    required
                  />
                  <Select
                    value={itemFormData.category_id.toString()}
                    onValueChange={(value) =>
                      setItemFormData((prev: CreateGroceryItemInput) => ({ ...prev, category_id: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    disabled={isLoading || !itemFormData.name.trim() || !itemFormData.category_id}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {isLoading ? 'Adding...' : '➕ Add Item'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Shopping List */}
            <div className="space-y-4">
              {Object.keys(groupedItems).length === 0 && unpurchasedItems.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                  <CardContent className="text-center py-8">
                    <p className="text-purple-600">🎉 Your shopping list is empty!</p>
                    <p className="text-sm text-purple-500 mt-1">Add some items above to get started</p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(groupedItems).map(([categoryName, items]) => (
                  <Card key={categoryName} className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-purple-800 flex items-center justify-between">
                        {categoryName}
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {items.map((item: GroceryItem) => (
                        <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors">
                          <Checkbox
                            checked={item.purchased}
                            onCheckedChange={() => handleTogglePurchased(item)}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                          <span className={`flex-1 ${item.purchased ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {item.name}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                🗑️
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Purchased Items */}
              {purchasedItems.length > 0 && (
                <Card className="bg-green-50/80 backdrop-blur-sm border-green-200 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-800 flex items-center justify-between">
                      ✅ Purchased Items
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {purchasedItems.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {purchasedItems.map((item: GroceryItem) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg">
                        <Checkbox
                          checked={item.purchased}
                          onCheckedChange={() => handleTogglePurchased(item)}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                        <span className="flex-1 line-through text-gray-500">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(item.category_id)}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4">
            {/* Add Category Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-800">Add New Category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <Input
                    placeholder="Enter category name..."
                    value={categoryFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCategoryFormData((prev: CreateCategoryInput) => ({ ...prev, name: e.target.value }))
                    }
                    className="border-purple-200 focus:border-purple-400"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !categoryFormData.name.trim()}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {isLoading ? 'Adding...' : '📁 Add Category'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Categories List */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-800">Your Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-center text-purple-600">No categories yet. Add one above!</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category: Category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-purple-800">{category.name}</h3>
                          <p className="text-sm text-purple-600">
                            {groceryItems.filter((item: GroceryItem) => item.category_id === category.id).length} items
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              🗑️
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the "{category.name}" category? All items in this category will also be deleted. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-800">📊 Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">{groceryItems.length}</div>
                    <div className="text-sm text-purple-600">Total Items</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{purchasedItems.length}</div>
                    <div className="text-sm text-green-600">Purchased</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{categories.length}</div>
                  <div className="text-sm text-blue-600">Categories</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
