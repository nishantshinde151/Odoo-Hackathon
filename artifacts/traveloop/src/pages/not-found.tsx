import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-6">This destination doesn't exist</p>
        <Button onClick={() => setLocation("/")} className="teal-gradient border-0 text-white">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
