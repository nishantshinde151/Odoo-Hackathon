import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useSignup } from "@workspace/api-client-react";
import { setToken } from "@/lib/api";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

type AuthForm = z.infer<typeof authSchema>;

const destinations = [
  { name: "Tokyo", country: "Japan", color: "from-rose-500/20 to-orange-500/20" },
  { name: "Paris", country: "France", color: "from-blue-500/20 to-purple-500/20" },
  { name: "Bali", country: "Indonesia", color: "from-teal-500/20 to-green-500/20" },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const { toast } = useToast();
  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const onSubmit = async (values: AuthForm) => {
    try {
      if (tab === "login") {
        const result = await loginMutation.mutateAsync({ data: { email: values.email, password: values.password } });
        setToken(result.token);
        setLocation("/");
      } else {
        const result = await signupMutation.mutateAsync({ data: { email: values.email, password: values.password, name: values.name } });
        setToken(result.token);
        setLocation("/");
      }
    } catch (err: unknown) {
      const message = (err as { data?: { error?: string } })?.data?.error ?? "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 sidebar-gradient p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl teal-gradient flex items-center justify-center">
            <Globe className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-serif text-2xl font-bold text-white">Traveloop</span>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-serif text-5xl font-bold text-white leading-tight mb-4">
              Plan your next<br />
              <span className="text-[hsl(38,85%,55%)]">great adventure.</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Build multi-city itineraries, track budgets, discover activities, and share your journey with the world.
            </p>
          </motion.div>

          <div className="mt-12 space-y-3">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex items-center gap-3 bg-gradient-to-r ${d.color} border border-white/10 rounded-xl px-4 py-3`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{d.name}</p>
                  <p className="text-white/50 text-xs">{d.country}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-sm">Your world. Your journey.</p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Globe className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl font-bold">Traveloop</span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Your next adventure awaits</p>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Create Account</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="signup" className="mt-0">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Alex Johnson" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full teal-gradient border-0 text-white font-semibold"
                  disabled={isPending}
                  data-testid="button-submit"
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {tab === "login" ? "Sign In" : "Create Account"}
                </Button>
              </form>
            </Form>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
