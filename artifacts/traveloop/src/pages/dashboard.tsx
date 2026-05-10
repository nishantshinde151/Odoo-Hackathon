import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { PlusCircle, Map, TrendingUp, MapPin, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useGetDashboard, useGetMe, getGetDashboardQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { getToken } from "@/lib/api";

function DashboardContent() {
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { enabled: !!getToken(), retry: false, queryKey: getGetMeQueryKey() } });
  const { data: dashboard, isLoading } = useGetDashboard({ query: { enabled: !!getToken(), queryKey: getGetDashboardQueryKey() } });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { label: "Total Trips", value: dashboard?.totalTrips ?? 0, icon: Map, color: "text-primary" },
    { label: "Upcoming", value: dashboard?.upcomingTrips ?? 0, icon: Calendar, color: "text-[hsl(38,85%,55%)]" },
    { label: "Destinations", value: dashboard?.totalDestinations ?? 0, icon: MapPin, color: "text-blue-500" },
    { label: "Budget Tracked", value: `$${(dashboard?.totalBudgetSpent ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting()}, <span className="text-primary">{user?.name?.split(" ")[0] ?? "Traveler"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Ready to plan your next adventure?</p>
        </div>
        <Button
          onClick={() => setLocation("/trips/new")}
          className="teal-gradient border-0 text-white font-semibold gap-2 shrink-0"
          data-testid="button-new-trip"
        >
          <PlusCircle className="w-4 h-4" />
          Plan New Trip
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="card-hover border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Trips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Trips</h2>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/trips")} className="text-primary gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : (dashboard?.recentTrips?.length ?? 0) === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Map className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium mb-1">No trips yet</p>
                <p className="text-sm text-muted-foreground/70 mb-4">Start planning your first adventure</p>
                <Button size="sm" onClick={() => setLocation("/trips/new")} className="teal-gradient border-0 text-white">
                  Create Trip
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dashboard?.recentTrips?.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Card
                    className="card-hover cursor-pointer border-border/60"
                    onClick={() => setLocation(`/trips/${trip.id}`)}
                    data-testid={`card-trip-${trip.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{trip.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(trip.startDate), "MMM d")} – {format(parseISO(trip.endDate), "MMM d, yyyy")}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {trip.stopCount} {trip.stopCount === 1 ? "stop" : "stops"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {trip.totalBudget && (
                            <span className="text-xs font-semibold text-[hsl(38,85%,55%)] bg-[hsl(38,85%,55%)]/10 px-2 py-1 rounded-full">
                              ${Number(trip.totalBudget).toLocaleString()}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Cities */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Trending Destinations</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {dashboard?.popularCities?.map((city, i) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="card-hover cursor-pointer border-border/60" onClick={() => setLocation("/cities")}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{city.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{city.country}</p>
                        </div>
                        {city.costIndex && (
                          <div className="ml-auto shrink-0">
                            <span className="text-xs text-muted-foreground">${Number(city.costIndex).toFixed(0)}/day</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <DashboardContent />
      </AppLayout>
    </RequireAuth>
  );
}
