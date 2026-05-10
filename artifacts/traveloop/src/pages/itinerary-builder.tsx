import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Search, MapPin, X, GripVertical, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import {
  useGetTrip, useListStops, useCreateStop, useDeleteStop, useReorderStops,
  useSearchCities, useListStopActivities, useAddStopActivity, useRemoveStopActivity,
  useSearchActivityCatalog, getGetTripQueryKey, getListStopsQueryKey, getListStopActivitiesQueryKey,
  getSearchActivityCatalogQueryKey, getSearchCitiesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { getToken } from "@/lib/api";

function StopCard({ stop, onDelete }: {
  stop: { id: number; tripId: number; cityName: string; country: string; startDate: string; endDate: string; order: number };
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showActivities, setShowActivities] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);

  const { data: activities = [] } = useListStopActivities(stop.id, {
    query: { enabled: showActivities, queryKey: getListStopActivitiesQueryKey(stop.id) }
  });
  const catalogParams2 = { q: activitySearch, cityId: undefined };
  const { data: catalog = [] } = useSearchActivityCatalog(catalogParams2, {
    query: { enabled: showCatalog, queryKey: getSearchActivityCatalogQueryKey(catalogParams2) }
  });

  const addActivity = useAddStopActivity();
  const removeActivity = useRemoveStopActivity();

  const handleAddActivity = async (item: { id: number; name: string; category: string; description?: string | null; cost?: number | null; duration?: number | null; imageUrl?: string | null }) => {
    try {
      await addActivity.mutateAsync({
        stopId: stop.id,
        data: {
          activityCatalogId: item.id,
          name: item.name,
          category: item.category,
          description: item.description ?? undefined,
          cost: item.cost ?? undefined,
          duration: item.duration ?? undefined,
          imageUrl: item.imageUrl ?? undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListStopActivitiesQueryKey(stop.id) });
      toast({ title: "Activity added!" });
    } catch {
      toast({ title: "Error", description: "Failed to add activity.", variant: "destructive" });
    }
  };

  const handleRemoveActivity = async (activityId: number) => {
    await removeActivity.mutateAsync({ stopId: stop.id, activityId });
    queryClient.invalidateQueries({ queryKey: getListStopActivitiesQueryKey(stop.id) });
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{stop.cityName}</h3>
            <p className="text-xs text-muted-foreground">{stop.country} · {format(parseISO(stop.startDate), "MMM d")} – {format(parseISO(stop.endDate), "MMM d")}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { setShowActivities(!showActivities); setShowCatalog(false); }}>
              {showActivities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showActivities && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-2 border-t border-border/50 space-y-2">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="flex-1 text-sm text-foreground">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.category}{a.cost ? ` · $${a.cost}` : ""}</span>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-destructive hover:text-destructive" onClick={() => handleRemoveActivity(a.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={() => setShowCatalog(!showCatalog)}>
                  <Plus className="w-3.5 h-3.5" />
                  {showCatalog ? "Hide Catalog" : "Add Activity"}
                </Button>

                {showCatalog && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search activities..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="text-sm h-8"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {catalog.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={() => handleAddActivity(item)}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}{item.cost ? ` · $${item.cost}` : ""}</p>
                          </div>
                          <Plus className="w-3.5 h-3.5 text-primary shrink-0" />
                        </div>
                      ))}
                      {catalog.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No activities found</p>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function ItineraryBuilderContent() {
  const { tripId } = useParams<{ tripId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(tripId);

  const [citySearch, setCitySearch] = useState("");
  const [selectedDates, setSelectedDates] = useState({ start: "", end: "" });
  const [showCitySearch, setShowCitySearch] = useState(false);

  const { data: trip, isLoading: tripLoading } = useGetTrip(id, { query: { enabled: !!id && !!getToken(), queryKey: getGetTripQueryKey(id) } });
  const { data: stops = [], isLoading: stopsLoading } = useListStops(id, { query: { enabled: !!id && !!getToken(), queryKey: getListStopsQueryKey(id) } });
  const { data: cities = [] } = useSearchCities({ q: citySearch }, { query: { enabled: citySearch.length > 1, queryKey: getSearchCitiesQueryKey({ q: citySearch }) } });

  const createStop = useCreateStop();
  const deleteStop = useDeleteStop();

  const handleAddStop = async (city: { id: number; name: string }) => {
    if (!selectedDates.start || !selectedDates.end) {
      toast({ title: "Select dates first", description: "Choose start and end dates for this stop.", variant: "destructive" });
      return;
    }
    try {
      await createStop.mutateAsync({
        tripId: id,
        data: { cityId: city.id, startDate: selectedDates.start, endDate: selectedDates.end },
      });
      queryClient.invalidateQueries({ queryKey: getListStopsQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
      setCitySearch("");
      setSelectedDates({ start: "", end: "" });
      setShowCitySearch(false);
      toast({ title: `${city.name} added!` });
    } catch {
      toast({ title: "Error", description: "Failed to add stop.", variant: "destructive" });
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    try {
      await deleteStop.mutateAsync({ tripId: id, stopId });
      queryClient.invalidateQueries({ queryKey: getListStopsQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
      toast({ title: "Stop removed" });
    } catch {
      toast({ title: "Error", description: "Failed to remove stop.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/trips/${id}`)} className="mb-4 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Trip
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Itinerary Builder</h1>
            {trip && <p className="text-muted-foreground text-sm">{trip.name}</p>}
          </div>
          <Button onClick={() => setShowCitySearch(!showCitySearch)} className="teal-gradient border-0 text-white gap-2" data-testid="button-add-stop">
            <Plus className="w-4 h-4" />
            Add Stop
          </Button>
        </div>

        {/* Add Stop Panel */}
        <AnimatePresence>
          {showCitySearch && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="border-primary/30 bg-primary/5 mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Add a Stop</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                      <Input type="date" value={selectedDates.start} onChange={(e) => setSelectedDates(p => ({ ...p, start: e.target.value }))} min={trip?.startDate} max={trip?.endDate} data-testid="input-stop-start" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
                      <Input type="date" value={selectedDates.end} onChange={(e) => setSelectedDates(p => ({ ...p, end: e.target.value }))} min={selectedDates.start || trip?.startDate} max={trip?.endDate} data-testid="input-stop-end" />
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search cities (e.g. Tokyo, Paris)"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      data-testid="input-city-search"
                    />
                  </div>

                  {cities.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border bg-card divide-y divide-border/50">
                      {cities.map((city) => (
                        <div
                          key={city.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleAddStop(city)}
                          data-testid={`city-result-${city.id}`}
                        >
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <p className="font-medium text-foreground text-sm">{city.name}</p>
                            <p className="text-xs text-muted-foreground">{city.country}{city.region ? `, ${city.region}` : ""}</p>
                          </div>
                          {createStop.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-auto text-primary" /> : <Plus className="w-4 h-4 ml-auto text-primary" />}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stops */}
        <div className="space-y-3">
          {stopsLoading ? (
            [1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : stops.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-10 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">No stops added yet</p>
                <p className="text-sm text-muted-foreground">Click "Add Stop" to start building your itinerary</p>
              </CardContent>
            </Card>
          ) : (
            stops.map((stop) => (
              <motion.div key={stop.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <StopCard stop={stop} onDelete={() => handleDeleteStop(stop.id)} />
              </motion.div>
            ))
          )}
        </div>

        {stops.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setLocation(`/trips/${id}`)} className="teal-gradient border-0 text-white font-semibold" data-testid="button-done">
              Done Building
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ItineraryBuilderPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <ItineraryBuilderContent />
      </AppLayout>
    </RequireAuth>
  );
}
