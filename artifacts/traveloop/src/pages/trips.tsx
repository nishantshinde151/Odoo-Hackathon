import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PlusCircle, Map, Calendar, MapPin, Edit, Trash2, Eye, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useListTrips, useDeleteTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isAfter, isBefore, parseISO as parse } from "date-fns";
import { getToken } from "@/lib/api";

function TripsContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: trips, isLoading } = useListTrips({ query: { enabled: !!getToken(), queryKey: getListTripsQueryKey() } });
  const deleteMutation = useDeleteTrip();

  const today = new Date().toISOString().split("T")[0];

  const handleDelete = async (tripId: number) => {
    try {
      await deleteMutation.mutateAsync({ tripId });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "Trip deleted", description: "Your trip has been removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete trip.", variant: "destructive" });
    }
  };

  const getStatus = (trip: { startDate: string; endDate: string }) => {
    if (trip.startDate > today) return { label: "Upcoming", color: "bg-blue-500/10 text-blue-600" };
    if (trip.endDate >= today) return { label: "In Progress", color: "bg-green-500/10 text-green-600" };
    return { label: "Completed", color: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
          <p className="text-muted-foreground mt-1">{trips?.length ?? 0} {trips?.length === 1 ? "trip" : "trips"} planned</p>
        </div>
        <Button onClick={() => setLocation("/trips/new")} className="teal-gradient border-0 text-white font-semibold gap-2" data-testid="button-new-trip">
          <PlusCircle className="w-4 h-4" />
          New Trip
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (trips?.length ?? 0) === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Map className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No trips yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start planning your first adventure. Add destinations, activities, and build your perfect itinerary.</p>
          <Button onClick={() => setLocation("/trips/new")} className="teal-gradient border-0 text-white gap-2">
            <PlusCircle className="w-4 h-4" />
            Plan Your First Trip
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips?.map((trip, i) => {
            const status = getStatus(trip);
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="group card-hover border-border/60 overflow-hidden h-full flex flex-col" data-testid={`card-trip-${trip.id}`}>
                  {trip.coverPhoto ? (
                    <div className="h-32 overflow-hidden">
                      <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-32 teal-gradient flex items-center justify-center">
                      <Map className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-base leading-tight flex-1 mr-2">{trip.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status.color}`}>{status.label}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      {trip.stopCount} {trip.stopCount === 1 ? "destination" : "destinations"}
                    </div>

                    {trip.totalBudget && (
                      <div className="text-sm font-semibold text-[hsl(38,85%,55%)] mb-3">
                        Budget: ${Number(trip.totalBudget).toLocaleString()}
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <Button variant="ghost" size="sm" className="flex-1 gap-1 text-xs" onClick={() => setLocation(`/trips/${trip.id}`)} data-testid={`button-view-${trip.id}`}>
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 gap-1 text-xs" onClick={() => setLocation(`/trips/${trip.id}/edit`)} data-testid={`button-edit-${trip.id}`}>
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs px-2" data-testid={`button-delete-${trip.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete trip?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{trip.name}" and all its stops, activities, and notes. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(trip.id)} className="bg-destructive text-destructive-foreground">
                              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <TripsContent />
      </AppLayout>
    </RequireAuth>
  );
}
