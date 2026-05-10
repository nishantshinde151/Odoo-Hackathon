import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, MapPin, Globe, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import { useSearchCities, getSearchCitiesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

function CitiesContent() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: cities = [], isLoading } = useSearchCities({ q: query || undefined }, {
    query: { staleTime: 30000, queryKey: getSearchCitiesQueryKey({ q: query || undefined }) }
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Explore Cities</h1>
          <p className="text-muted-foreground">Discover destinations for your next adventure</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            className="pl-11 h-11 text-base"
            placeholder="Search cities or countries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="input-city-search"
          />
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-14 h-14 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No cities found</p>
            <p className="text-sm text-muted-foreground/70">Try a different search term</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city, i) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="card-hover border-border/60 overflow-hidden cursor-pointer" data-testid={`city-card-${city.id}`}>
                  {city.imageUrl ? (
                    <div className="h-28 overflow-hidden">
                      <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{city.name}</h3>
                    <p className="text-sm text-muted-foreground">{city.country}{city.region ? `, ${city.region}` : ""}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        {city.costIndex && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            ${Number(city.costIndex).toFixed(0)}/day
                          </Badge>
                        )}
                        {city.popularity && city.popularity > 80 && (
                          <Badge className="text-xs font-normal bg-[hsl(38,85%,55%)]/15 text-[hsl(28,90%,45%)] border-0">
                            <TrendingUp className="w-2.5 h-2.5 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>

                    {city.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{city.description}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function CitiesPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <CitiesContent />
      </AppLayout>
    </RequireAuth>
  );
}
