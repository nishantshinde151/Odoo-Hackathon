import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useGetTrip, useUpdateTrip, getGetTripQueryKey, getListTripsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { getToken } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Trip name is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  coverPhoto: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  totalBudget: z.string().optional(),
});

type TripForm = z.infer<typeof schema>;

function EditTripContent() {
  const { tripId } = useParams<{ tripId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(tripId);

  const { data: trip, isLoading } = useGetTrip(id, { query: { enabled: !!id && !!getToken(), queryKey: getGetTripQueryKey(id) } });
  const updateMutation = useUpdateTrip();

  const form = useForm<TripForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", coverPhoto: "", totalBudget: "" },
  });

  useEffect(() => {
    if (trip) {
      form.reset({
        name: trip.name,
        description: trip.description ?? "",
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverPhoto: trip.coverPhoto ?? "",
        totalBudget: trip.totalBudget ? String(trip.totalBudget) : "",
      });
    }
  }, [trip, form]);

  const onSubmit = async (values: TripForm) => {
    try {
      await updateMutation.mutateAsync({
        tripId: id,
        data: {
          name: values.name,
          description: values.description,
          startDate: values.startDate,
          endDate: values.endDate,
          coverPhoto: values.coverPhoto || undefined,
          totalBudget: values.totalBudget ? Number(values.totalBudget) : undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "Trip updated!" });
      setLocation(`/trips/${id}`);
    } catch {
      toast({ title: "Error", description: "Failed to update trip.", variant: "destructive" });
    }
  };

  if (isLoading) return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/trips/${id}`)} className="mb-6 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Trip
        </Button>
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Trip</h1>

        <Card className="border-border/60">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Name *</FormLabel>
                    <FormControl><Input {...field} data-testid="input-trip-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea rows={3} className="resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="totalBudget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget (USD)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 3000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="coverPhoto" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Photo URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation(`/trips/${id}`)}>Cancel</Button>
                  <Button type="submit" className="flex-1 teal-gradient border-0 text-white font-semibold" disabled={updateMutation.isPending} data-testid="button-save">
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function EditTripPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <EditTripContent />
      </AppLayout>
    </RequireAuth>
  );
}
