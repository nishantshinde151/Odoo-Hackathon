import { useLocation } from "wouter";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useGetProfile, useUpdateProfile, useDeleteAccount, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { clearToken } from "@/lib/api";
import { getToken } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  photo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  language: z.string(),
});

type ProfileForm = z.infer<typeof schema>;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
];

function ProfileContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useGetProfile({ query: { enabled: !!getToken(), queryKey: getGetProfileQueryKey() } });
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteAccount();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", photo: "", language: "en" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name, photo: profile.photo ?? "", language: profile.language });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileForm) => {
    try {
      await updateMutation.mutateAsync({ data: { name: values.name, photo: values.photo || undefined, language: values.language } });
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMutation.mutateAsync();
      clearToken();
      setLocation("/login");
    } catch {
      toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" });
    }
  };

  const initials = profile?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "T";

  if (isLoading) return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-card rounded-xl border border-border/60">
          <Avatar className="w-16 h-16">
            {profile?.photo ? (
              <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <AvatarFallback className="text-xl font-bold bg-primary/15 text-primary">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{profile?.name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Member since {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : ""}</p>
          </div>
        </div>

        <Card className="border-border/60 mb-4">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="photo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Photo URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://..." {...field} data-testid="input-photo" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="language" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full teal-gradient border-0 text-white font-semibold" disabled={updateMutation.isPending} data-testid="button-save-profile">
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all trip data. This cannot be undone.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive hover:text-white gap-2" data-testid="button-delete-account">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete your account and all trips. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">Delete Account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <AppLayout>
        <ProfileContent />
      </AppLayout>
    </RequireAuth>
  );
}
