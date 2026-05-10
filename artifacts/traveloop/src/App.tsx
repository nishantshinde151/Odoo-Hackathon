import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getToken } from "@/lib/api";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import TripsPage from "@/pages/trips";
import NewTripPage from "@/pages/new-trip";
import TripDetailPage from "@/pages/trip-detail";
import EditTripPage from "@/pages/edit-trip";
import ItineraryBuilderPage from "@/pages/itinerary-builder";
import BudgetPage from "@/pages/budget";
import PackingPage from "@/pages/packing";
import NotesPage from "@/pages/notes";
import SharedTripPage from "@/pages/shared-trip";
import ProfilePage from "@/pages/profile";
import CitiesPage from "@/pages/cities";
import ActivitiesPage from "@/pages/activities-catalog";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

// Wire up auth token for all API calls
setAuthTokenGetter(() => getToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={DashboardPage} />
      <Route path="/trips/new" component={NewTripPage} />
      <Route path="/trips/:tripId/edit" component={EditTripPage} />
      <Route path="/trips/:tripId/builder" component={ItineraryBuilderPage} />
      <Route path="/trips/:tripId/budget" component={BudgetPage} />
      <Route path="/trips/:tripId/packing" component={PackingPage} />
      <Route path="/trips/:tripId/notes" component={NotesPage} />
      <Route path="/trips/:tripId" component={TripDetailPage} />
      <Route path="/trips" component={TripsPage} />
      <Route path="/share/:shareCode" component={SharedTripPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/cities" component={CitiesPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
