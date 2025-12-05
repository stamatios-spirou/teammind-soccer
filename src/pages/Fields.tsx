import { MapPin, Users, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fields = [
  {
    id: "1",
    name: "Lubetkin Field",
    address: "100 Lock Street, Newark, NJ 07102",
    status: "available",
    capacity: 22,
    upcomingGames: 3,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80",
  },
  {
    id: "2",
    name: "Frederick Douglass Field",
    address: "42 Warren Street, Newark, NJ 07102",
    status: "available",
    capacity: 22,
    upcomingGames: 2,
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80",
  },
];

const Fields = () => {
  return (
    <div className="min-h-screen pt-6 px-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Fields</h1>
        <p className="text-muted-foreground">NJIT Soccer Locations</p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <Card key={field.id} className="overflow-hidden bg-card border-border">
            <div className="relative h-32">
              <img
                src={field.image}
                alt={field.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <Badge
                className={`absolute top-3 right-3 ${
                  field.status === "available"
                    ? "bg-green-500/90 text-white"
                    : "bg-red-500/90 text-white"
                }`}
              >
                {field.status === "available" ? "Available" : "In Use"}
              </Badge>
              <h3 className="absolute bottom-3 left-4 text-xl font-bold text-white">
                {field.name}
              </h3>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="text-sm">{field.address}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">Capacity: {field.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">{field.upcomingGames} games today</span>
                </div>
              </div>

              <button className="w-full flex items-center justify-between py-3 px-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <span className="font-medium text-primary">View Schedule</span>
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Fields;
