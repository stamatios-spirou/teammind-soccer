import { useState, useEffect } from "react";
import { MapPin, Users, Clock, ChevronRight, Navigation, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";

interface Field {
  id: string;
  name: string;
  location: string;
  status: string | null;
  capacity: number | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
  gamesCount?: number;
  isInUse?: boolean;
}

const Fields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchFields();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchFields = async () => {
    try {
      // Fetch fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("fields")
        .select("*");

      if (fieldsError) throw fieldsError;

      // Fetch today's matches to determine field status
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();
      const now = today.toISOString();

      const { data: matchesData } = await supabase
        .from("matches")
        .select("field_id, scheduled_at, duration_minutes")
        .gte("scheduled_at", todayStart)
        .lte("scheduled_at", todayEnd);

      // Process fields with game counts and in-use status
      const processedFields = (fieldsData || []).map((field) => {
        const fieldMatches = matchesData?.filter((m) => m.field_id === field.id) || [];
        
        // Check if field is currently in use
        const isInUse = fieldMatches.some((match) => {
          const matchStart = new Date(match.scheduled_at);
          const matchEnd = new Date(matchStart.getTime() + (match.duration_minutes || 90) * 60000);
          const currentTime = new Date();
          return currentTime >= matchStart && currentTime <= matchEnd;
        });

        return {
          ...field,
          gamesCount: fieldMatches.length,
          isInUse,
        };
      });

      setFields(processedFields);
    } catch (error: any) {
      toast.error("Error loading fields", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Sort fields by distance if user location is available
  const sortedFields = [...fields].sort((a, b) => {
    if (userLocation && a.latitude && a.longitude && b.latitude && b.longitude) {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distA - distB;
    }
    return 0;
  }).map((field) => ({
    ...field,
    distance:
      userLocation && field.latitude && field.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, field.latitude, field.longitude)
        : undefined,
  }));

  const getFieldImage = (fieldName: string) => {
    if (fieldName.toLowerCase().includes("lubetkin")) {
      return "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80";
    }
    return "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 px-4 pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 px-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Fields</h1>
        <p className="text-muted-foreground">NJIT Soccer Locations</p>
        {locationLoading ? (
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Getting your location...
          </p>
        ) : userLocation ? (
          <p className="text-sm text-primary mt-2 flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Sorted by distance from you
          </p>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={getUserLocation}
            className="mt-2 text-primary hover:text-primary/80"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Enable location for distance sorting
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedFields.map((field) => (
          <Card key={field.id} className="overflow-hidden bg-card border-border">
            <div className="relative h-32">
              <img
                src={getFieldImage(field.name)}
                alt={field.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <Badge
                className={`absolute top-3 right-3 ${
                  field.isInUse
                    ? "bg-red-500/90 text-white"
                    : field.status === "available"
                    ? "bg-green-500/90 text-white"
                    : "bg-yellow-500/90 text-white"
                }`}
              >
                {field.isInUse ? "In Use" : field.status === "available" ? "Available" : "Unavailable"}
              </Badge>
              <h3 className="absolute bottom-3 left-4 text-xl font-bold text-white">
                {field.name}
              </h3>
              {field.distance !== undefined && (
                <span className="absolute bottom-3 right-4 text-sm text-white/80 bg-black/50 px-2 py-1 rounded">
                  {field.distance.toFixed(1)} mi away
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="text-sm">{field.location}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">Capacity: {field.capacity || 22}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">{field.gamesCount || 0} games today</span>
                </div>
              </div>

              <button className="w-full flex items-center justify-between py-3 px-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <span className="font-medium text-primary">View Schedule</span>
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </Card>
        ))}

        {sortedFields.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No fields found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fields;
