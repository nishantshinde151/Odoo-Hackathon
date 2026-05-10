import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useGetTripBudget, useGetTrip, getGetTripBudgetQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getToken } from "@/lib/api";

const CHART_COLORS = ["hsl(185,60%,35%)", "hsl(38,85%,55%)", "hsl(210,75%,50%)", "hsl(140,55%,40%)", "hsl(280,55%,55%)", "hsl(0,72%,51%)"];

function BudgetContent() {
  const { tripId } = useParams<{ tripId: string }>();
  const [, setLocation] = useLocation();
  const id = Number(tripId);

  const { data: trip } = useGetTrip(id, { query: { enabled: !!id && !!getToken(), queryKey: getGetTripQueryKey(id) } });
  const { data: budget, isLoading } = useGetTripBudget(id, { query: { enabled: !!id && !!getToken(), queryKey: getGetTripBudgetQueryKey(id) } });

  if (isLoading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );

  const usagePercent = budget?.totalBudget ? Math.min(100, ((budget.totalEstimated / budget.totalBudget) * 100)) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/trips/${id}`)} className="mb-4 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Trip
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[hsl(38,85%,55%)]/15 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[hsl(38,85%,55%)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budget Breakdown</h1>
            {trip && <p className="text-muted-foreground text-sm">{trip.name}</p>}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-foreground">{budget?.totalBudget ? `$${Number(budget.totalBudget).toLocaleString()}` : "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold text-primary">${(budget?.totalEstimated ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Per Day Average</p>
              <p className="text-2xl font-bold text-foreground">${Math.round(budget?.perDayAverage ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className={`border-border/60 ${budget?.isOverBudget ? "border-destructive/40 bg-destructive/5" : ""}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Remaining</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${budget?.isOverBudget ? "text-destructive" : "text-green-600"}`}>
                  {budget?.remainingBudget !== null && budget?.remainingBudget !== undefined ? `$${Math.abs(budget.remainingBudget).toLocaleString()}` : "—"}
                </p>
                {budget?.isOverBudget ? <AlertTriangle className="w-4 h-4 text-destructive" /> : budget?.remainingBudget !== null ? <CheckCircle className="w-4 h-4 text-green-500" /> : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget bar */}
        {budget?.totalBudget && (
          <Card className="border-border/60 mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Budget Usage</span>
                <span className={`text-sm font-semibold ${budget.isOverBudget ? "text-destructive" : "text-primary"}`}>{usagePercent.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercent} className="h-3" />
              {budget.isOverBudget && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Over budget by ${Math.abs(budget.remainingBudget ?? 0).toLocaleString()}</p>}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Category Breakdown Pie */}
          {(budget?.byCategory?.length ?? 0) > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={budget?.byCategory} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {budget?.byCategory?.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Per-stop chart */}
          {(budget?.stops?.length ?? 0) > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cost by Stop</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={budget?.stops} barSize={28}>
                    <XAxis dataKey="cityName" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Activity Cost"]} />
                    <Bar dataKey="activityCost" fill="hsl(185,60%,35%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stop breakdown table */}
        {(budget?.stops?.length ?? 0) > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stop Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/50">
                {budget?.stops?.map((stop) => (
                  <div key={stop.stopId} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">{stop.cityName}</p>
                      <p className="text-xs text-muted-foreground">{stop.days} {stop.days === 1 ? "day" : "days"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${stop.activityCost.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">${Math.round(stop.activityCost / stop.days)}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(budget?.totalEstimated ?? 0) === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="p-10 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">No cost data yet</p>
              <p className="text-sm text-muted-foreground mb-4">Add activities with costs to your stops to see budget breakdown</p>
              <Button onClick={() => setLocation(`/trips/${id}/builder`)} variant="outline">Open Builder</Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

export default function BudgetPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <BudgetContent />
      </AppLayout>
    </RequireAuth>
  );
}
