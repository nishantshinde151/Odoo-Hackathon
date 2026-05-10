import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Share2, Edit, Building2, Loader2, Package, FileText, DollarSign, Map, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useGetTrip, useToggleTripShare, getGetTripQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInDays } from "date-fns";
import { getToken } from "@/lib/api";

function TripDetailContent() {
  const { tripId } = useParams<{ tripId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(tripId);

  const { data: trip, isLoading } = useGetTrip(id, { query: { enabled: !!id && !!getToken(), queryKey: getGetTripQueryKey(id) } });
  const shareMutation = useToggleTripShare();

  const handleToggleShare = async () => {
    if (!trip) return;
    try {
      await shareMutation.mutateAsync({ tripId: id, data: { isPublic: !trip.isPublic } });
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
      if (!trip.isPublic) {
        toast({ title: "Trip shared!", description: "Anyone with the link can view your itinerary." });
      } else {
        toast({ title: "Trip made private", description: "The share link has been revoked." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update sharing.", variant: "destructive" });
    }
  };

  const copyShareLink = () => {
    if (!trip?.shareCode) return;
    const url = `${window.location.origin}/share/${trip.shareCode}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share link copied to clipboard." });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-6 text-center py-20">
        <h2 className="text-xl font-semibold text-foreground mb-2">Trip not found</h2>
        <Button onClick={() => setLocation("/trips")} variant="outline">Back to Trips</Button>
      </div>
    );
  }

  const days = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/trips")} className="mb-4 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </Button>

        {/* Header Card */}
        <Card className="border-border/60 overflow-hidden mb-6">
          {trip.coverPhoto && (
            <div className="h-48 overflow-hidden">
              <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover" />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{trip.name}</h1>
                {trip.description && <p className="text-muted-foreground mb-3">{trip.description}</p>}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-primary" />
                    {days} {days === 1 ? "day" : "days"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {trip.stops?.length ?? 0} {trip.stops?.length === 1 ? "stop" : "stops"}
                  </span>
                  {trip.totalBudget && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[hsl(38,85%,55%)]" />
                      <span className="text-[hsl(38,85%,55%)] font-semibold">${Number(trip.totalBudget).toLocaleString()}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setLocation(`/trips/${id}/edit`)} className="gap-1.5" data-testid="button-edit-trip">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={handleToggleShare} disabled={shareMutation.isPending} className="gap-1.5" data-testid="button-share-trip">
                  <Share2 className="w-3.5 h-3.5" />
                  {trip.isPublic ? "Make Private" : "Share"}
                </Button>
                {trip.isPublic && trip.shareCode && (
                  <Button size="sm" variant="outline" onClick={copyShareLink} className="gap-1.5">
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </Button>
                )}
                <Button size="sm" onClick={() => setLocation(`/trips/${id}/builder`)} className="teal-gradient border-0 text-white gap-1.5" data-testid="button-builder">
                  <Building2 className="w-3.5 h-3.5" /> Builder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick nav tabs */}
        <Tabs defaultValue="itinerary">
          <TabsList className="mb-6">
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="budget" onClick={() => setLocation(`/trips/${id}/budget`)}>Budget</TabsTrigger>
            <TabsTrigger value="packing" onClick={() => setLocation(`/trips/${id}/packing`)}>Packing</TabsTrigger>
            <TabsTrigger value="notes" onClick={() => setLocation(`/trips/${id}/notes`)}>Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary">
            {(!trip.stops || trip.stops.length === 0) ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-10 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-medium text-foreground mb-1">No stops yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Add cities and activities to your itinerary</p>
                  <Button onClick={() => setLocation(`/trips/${id}/builder`)} className="teal-gradient border-0 text-white gap-2">
                    <Building2 className="w-4 h-4" /> Open Builder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {trip.stops.map((stop, i) => {
                  const stopDays = differenceInDays(parseISO(stop.endDate), parseISO(stop.startDate)) + 1;
                  return (
                    <motion.div key={stop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <Card className="border-border/60">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full teal-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {i + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-lg">{stop.cityName}</h3>
                                <p className="text-sm text-muted-foreground">{stop.country} · {stopDays} {stopDays === 1 ? "day" : "days"}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(stop.startDate), "MMM d")} – {format(parseISO(stop.endDate), "MMM d")}
                            </span>
                          </div>

                          {stop.activities && stop.activities.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-2">
                              {stop.activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{activity.name}</p>
                                    <p className="text-xs text-muted-foreground">{activity.category}{activity.cost ? ` · $${Number(activity.cost)}` : ""}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No activities added yet</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default function TripDetailPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <TripDetailContent />
      </AppLayout>
    </RequireAuth>
  );
}
