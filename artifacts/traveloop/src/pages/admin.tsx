import { motion } from "framer-motion";
import { Users, Map, MapPin, Globe, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, parseISO } from "date-fns";
import { getToken } from "@/lib/api";

const COLORS = ["hsl(185,60%,35%)", "hsl(38,85%,55%)", "hsl(210,75%,50%)", "hsl(140,55%,40%)", "hsl(280,55%,55%)"];

function AdminContent() {
  const { data: stats, isLoading } = useGetAdminStats({ query: { enabled: !!getToken(), queryKey: getGetAdminStatsQueryKey() } });

  const summaryCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Trips", value: stats?.totalTrips ?? 0, icon: Map, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Stops", value: stats?.totalStops ?? 0, icon: MapPin, color: "text-[hsl(38,85%,55%)]", bg: "bg-[hsl(38,85%,55%)]/10" },
    { label: "Public Trips", value: stats?.publicTrips ?? 0, icon: Globe, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm">Platform usage and trends</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="border-border/60">
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                  </div>
                  {isLoading ? <Skeleton className="h-8 w-16" /> : (
                    <p className="text-2xl font-bold text-foreground" data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>{card.value.toLocaleString()}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Top Cities chart */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Top Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats?.topCities ?? []} layout="vertical" barSize={18}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="cityName" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(v: number) => [v, "Trips"]} />
                    <Bar dataKey="count" fill="hsl(185,60%,35%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Platform breakdown pie */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Trip Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Private", value: Math.max(0, (stats?.totalTrips ?? 0) - (stats?.publicTrips ?? 0)) },
                        { name: "Public", value: stats?.publicTrips ?? 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={12}
                    >
                      {[0, 1].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (stats?.recentActivity?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="divide-y divide-border/50">
                {stats?.recentActivity?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <p className="text-sm text-foreground">{item.description}</p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-3">{format(parseISO(item.createdAt), "MMM d, h:mm a")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <AdminContent />
      </AppLayout>
    </RequireAuth>
  );
}
