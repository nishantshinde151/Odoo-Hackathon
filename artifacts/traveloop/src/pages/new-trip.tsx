import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useCreateTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Trip name is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  coverPhoto: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  totalBudget: z.string().optional(),
}).refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type TripForm = z.infer<typeof schema>;

function NewTripContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateTrip();

  const form = useForm<TripForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", startDate: "", endDate: "", coverPhoto: "", totalBudget: "" },
  });

  const onSubmit = async (values: TripForm) => {
    try {
      const trip = await createMutation.mutateAsync({
        data: {
          name: values.name,
          description: values.description,
          startDate: values.startDate,
          endDate: values.endDate,
          coverPhoto: values.coverPhoto || undefined,
          totalBudget: values.totalBudget ? Number(values.totalBudget) : undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "Trip created!", description: `"${trip.name}" is ready to build.` });
      setLocation(`/trips/${trip.id}/builder`);
    } catch {
      toast({ title: "Error", description: "Failed to create trip.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setLocation("/trips")} className="mb-6 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Trips
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl teal-gradient flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Trip</h1>
            <p className="text-muted-foreground text-sm">Start planning your adventure</p>
          </div>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. European Summer Adventure" {...field} data-testid="input-trip-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your trip..." className="resize-none" rows={3} {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="totalBudget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 3000" {...field} data-testid="input-budget" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="coverPhoto" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Photo URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} data-testid="input-cover-photo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/trips")}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 teal-gradient border-0 text-white font-semibold" disabled={createMutation.isPending} data-testid="button-create-trip">
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create & Build Itinerary
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

export default function NewTripPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <NewTripContent />
      </AppLayout>
    </RequireAuth>
  );
}
