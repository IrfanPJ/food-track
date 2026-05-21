import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InventoryList from '@/components/meal-prep/InventoryList'
import ShoppingList from '@/components/meal-prep/ShoppingList'
import PrepPlanner from '@/components/meal-prep/PrepPlanner'

export default function MealPrepPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Meal Prep</h1>
        <p className="text-sm text-zinc-500">Manage your pantry and plan your meals</p>
      </div>

      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="planner">Weekly Planner</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="shopping">Shopping List</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="mt-6">
          <PrepPlanner />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <InventoryList />
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="mt-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <ShoppingList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
