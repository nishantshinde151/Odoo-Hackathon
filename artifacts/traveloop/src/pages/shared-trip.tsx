import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Globe, MapPin, Calendar, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicTrip, getGetPublicTripQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInDays } from "date-fns";

export default function SharedTripPage() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const { toast } = useToast();
  const { data: trip, isLoading, isError } = useGetPublicTrip(shareCode, {
    query: { enabled: !!shareCode, queryKey: getGetPublicTripQueryKey(shareCode) }
  });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!" });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );

  if (isError || !trip) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Globe className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Trip not found</h2>
        <p className="text-muted-foreground">This trip may have been made private or doesn't exist.</p>
      </div>
    </div>
  );

  const days = differenceInDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sidebar-gradient py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-serif font-bold text-white">Traveloop</span>
            <span className="text-white/40 ml-2">· Shared Itinerary</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-white mb-3">{trip.name}</h1>
          {trip.description && <p className="text-white/70 mb-4">{trip.description}</p>}
          <div className="flex flex-wrap gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{trip.stops?.length ?? 0} stops · {days} days</span>
          </div>
          <div className="flex gap-3 mt-5">
            <Button size="sm" onClick={copyLink} className="bg-white/15 hover:bg-white/25 text-white border-0 gap-1.5" data-testid="button-copy-link">
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </Button>
            <Button size="sm" className="teal-gradient border-0 text-white gap-1.5" onClick={() => { if (navigator.share) navigator.share({ title: trip.name, url: window.location.href }); }} data-testid="button-share">
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Itinerary</h2>

        {(!trip.stops || trip.stops.length === 0) ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-10 text-center">
              <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No stops in this itinerary</p>
            </CardContent>
          </Card>
        ) : (
          trip.stops.map((stop, i) => {
            const stopDays = differenceInDays(parseISO(stop.endDate), parseISO(stop.startDate)) + 1;
            return (
              <motion.div key={stop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-border/60">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full teal-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">{i + 1}</div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{stop.cityName}</h3>
                        <p className="text-sm text-muted-foreground">{stop.country} · {format(parseISO(stop.startDate), "MMM d")} – {format(parseISO(stop.endDate), "MMM d")} ({stopDays} days)</p>
                      </div>
                    </div>

                    {stop.activities && stop.activities.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {stop.activities.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{activity.name}</p>
                              <p className="text-xs text-muted-foreground">{activity.category}{activity.cost ? ` · $${activity.cost}` : ""}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}

        <div className="pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-serif font-bold text-primary">Traveloop</span> · Plan your own trip at <a href="/" className="text-primary hover:underline">traveloop.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}
