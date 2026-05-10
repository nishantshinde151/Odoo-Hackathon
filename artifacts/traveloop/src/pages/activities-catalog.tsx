import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Activity, DollarSign, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useSearchActivityCatalog, getSearchActivityCatalogQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["", "sightseeing", "food", "adventure", "culture", "shopping", "nature", "entertainment", "wellness", "transport"];

const categoryColors: Record<string, string> = {
  sightseeing: "bg-blue-500/10 text-blue-600",
  food: "bg-orange-500/10 text-orange-600",
  adventure: "bg-red-500/10 text-red-600",
  culture: "bg-purple-500/10 text-purple-600",
  shopping: "bg-pink-500/10 text-pink-600",
  nature: "bg-green-500/10 text-green-600",
  entertainment: "bg-yellow-500/10 text-yellow-600",
  wellness: "bg-teal-500/10 text-teal-600",
  transport: "bg-gray-500/10 text-gray-600",
};

function ActivitiesCatalogContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [maxCost, setMaxCost] = useState("");

  const catalogParams = {
    q: query || undefined,
    category: category || undefined,
    maxCost: maxCost ? Number(maxCost) : undefined,
  };
  const { data: activities = [], isLoading } = useSearchActivityCatalog(catalogParams, {
    query: { staleTime: 30000, queryKey: getSearchActivityCatalogQueryKey(catalogParams) }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Activity Catalog</h1>
          <p className="text-muted-foreground">Browse experiences to add to your trips</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search activities..." value={query} onChange={(e) => setQuery(e.target.value)} data-testid="input-activity-search" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44" data-testid="select-category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {CATEGORIES.filter(Boolean).map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-36">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-8" type="number" placeholder="Max cost" value={maxCost} onChange={(e) => setMaxCost(e.target.value)} data-testid="input-max-cost" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-14 h-14 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No activities found</p>
            <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity, i) => (
              <motion.div key={activity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="card-hover border-border/60 h-full flex flex-col" data-testid={`activity-card-${activity.id}`}>
                  {activity.imageUrl ? (
                    <div className="h-32 overflow-hidden rounded-t-xl">
                      <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center rounded-t-xl">
                      <Activity className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{activity.name}</h3>
                      <Badge className={`text-xs shrink-0 ${categoryColors[activity.category] ?? "bg-muted text-muted-foreground"} border-0 capitalize`}>{activity.category}</Badge>
                    </div>

                    {activity.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{activity.description}</p>}

                    <div className="flex items-center gap-3 mt-auto">
                      {activity.cost !== null && activity.cost !== undefined && (
                        <span className="text-sm font-semibold text-[hsl(38,85%,55%)] flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />{activity.cost}
                        </span>
                      )}
                      {activity.duration !== null && activity.duration !== undefined && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{activity.duration}h
                        </span>
                      )}
                      {activity.cityName && <span className="text-xs text-muted-foreground ml-auto">{activity.cityName}</span>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ActivitiesCatalogPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <ActivitiesCatalogContent />
      </AppLayout>
    </RequireAuth>
  );
}
