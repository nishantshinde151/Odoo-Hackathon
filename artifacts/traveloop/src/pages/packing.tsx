import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Check, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import {
  useListPackingItems, useCreatePackingItem, useUpdatePackingItem, useDeletePackingItem,
  getListPackingItemsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetTrip, getGetTripQueryKey } from "@workspace/api-client-react";
import { getToken } from "@/lib/api";

const CATEGORIES = ["clothing", "documents", "electronics", "toiletries", "general", "medications", "accessories"];

const categoryColors: Record<string, string> = {
  clothing: "bg-blue-500/10 text-blue-600",
  documents: "bg-amber-500/10 text-amber-600",
  electronics: "bg-purple-500/10 text-purple-600",
  toiletries: "bg-teal-500/10 text-teal-600",
  general: "bg-gray-500/10 text-gray-600",
  medications: "bg-red-500/10 text-red-600",
  accessories: "bg-pink-500/10 text-pink-600",
};

function PackingContent() {
  const { tripId } = useParams<{ tripId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(tripId);

  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("general");

  const { data: trip } = useGetTrip(id, { query: { enabled: !!id && !!getToken(), queryKey: getGetTripQueryKey(id) } });
  const { data: items = [], isLoading } = useListPackingItems(id, { query: { enabled: !!id && !!getToken(), queryKey: getListPackingItemsQueryKey(id) } });
  const createMutation = useCreatePackingItem();
  const updateMutation = useUpdatePackingItem();
  const deleteMutation = useDeletePackingItem();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      await createMutation.mutateAsync({ tripId: id, data: { name: newItem.trim(), category: newCategory } });
      queryClient.invalidateQueries({ queryKey: getListPackingItemsQueryKey(id) });
      setNewItem("");
    } catch {
      toast({ title: "Error", description: "Failed to add item.", variant: "destructive" });
    }
  };

  const handleToggle = async (itemId: number, isPacked: boolean) => {
    await updateMutation.mutateAsync({ tripId: id, itemId, data: { isPacked: !isPacked } });
    queryClient.invalidateQueries({ queryKey: getListPackingItemsQueryKey(id) });
  };

  const handleDelete = async (itemId: number) => {
    await deleteMutation.mutateAsync({ tripId: id, itemId });
    queryClient.invalidateQueries({ queryKey: getListPackingItemsQueryKey(id) });
  };

  const packedCount = items.filter((i) => i.isPacked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const grouped = CATEGORIES.reduce<Record<string, typeof items>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/trips/${id}`)} className="mb-4 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Trip
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Packing List</h1>
            {trip && <p className="text-muted-foreground text-sm">{trip.name}</p>}
          </div>
        </div>

        {totalCount > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{packedCount} of {totalCount} packed</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full teal-gradient rounded-full"
              />
            </div>
          </div>
        )}

        {/* Add form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <Input
            placeholder="Add item (e.g. Passport)"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1"
            data-testid="input-item-name"
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-36" data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="teal-gradient border-0 text-white" disabled={createMutation.isPending} data-testid="button-add-item">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </form>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : totalCount === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-10 text-center">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Packing list is empty</p>
              <p className="text-sm text-muted-foreground">Add items above to start your packing list</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, catItems]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 capitalize">{category}</h3>
                <div className="space-y-1.5">
                  {catItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${item.isPacked ? "bg-muted/50 border-border/40" : "bg-card border-border/60"}`}
                      data-testid={`item-${item.id}`}
                    >
                      <button
                        onClick={() => handleToggle(item.id, item.isPacked)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${item.isPacked ? "border-primary bg-primary text-white" : "border-border"}`}
                        data-testid={`checkbox-${item.id}`}
                      >
                        {item.isPacked && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.isPacked ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${categoryColors[item.category] ?? "bg-muted text-muted-foreground"}`}>{item.category}</span>
                      <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function PackingPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <PackingContent />
      </AppLayout>
    </RequireAuth>
  );
}
