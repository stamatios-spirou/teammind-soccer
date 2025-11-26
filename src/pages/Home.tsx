import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/Match/MatchCard";
import { Bell, Zap, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const upcomingMatches = [
  {
    id: "1",
    date: "Today",
    time: "6:00 PM",
    field: "Field A - Main Campus",
    playersCount: 8,
    maxPlayers: 14,
    fairnessScore: 9,
    skillLevel: "Intermediate",
    gameType: "casual" as const,
  },
  {
    id: "2",
    date: "Tomorrow",
    time: "5:30 PM",
    field: "Field B - Recreation Center",
    playersCount: 12,
    maxPlayers: 14,
    fairnessScore: 8,
    skillLevel: "Advanced",
    gameType: "competitive" as const,
  },
  {
    id: "3",
    date: "Friday",
    time: "7:00 PM",
    field: "Field C - West Campus",
    playersCount: 6,
    maxPlayers: 10,
    fairnessScore: 7,
    skillLevel: "Beginner",
    gameType: "casual" as const,
  },
];

const Home = () => {
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const { toast } = useToast();

  const handleAutoPlace = () => {
    if (!selectedSlot) {
      toast({
        title: "Select a time slot",
        description: "Please choose when you'd like to play",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Finding your perfect match!",
      description: "Our AI is analyzing available games...",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="bg-gradient-to-b from-navy-dark to-background px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, Alex!</h1>
            <p className="text-sm text-muted-foreground">Ready for your next game?</p>
          </div>
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
        </div>

        {/* Auto-Place Section */}
        <div className="bg-card rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAutoPlace}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-14 text-lg font-bold shadow-glow-green"
            >
              <Zap className="w-5 h-5 mr-2" />
              Auto-Place Me!
            </Button>
            
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger className="flex-1 h-14 rounded-xl bg-muted border-border">
                <SelectValue placeholder="Select Time Slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today-6pm">Today 6:00 PM</SelectItem>
                <SelectItem value="tomorrow-5:30pm">Tomorrow 5:30 PM</SelectItem>
                <SelectItem value="friday-7pm">Friday 7:00 PM</SelectItem>
                <SelectItem value="saturday-4pm">Saturday 4:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Upcoming Matches Section */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Upcoming Matches</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
          </Button>
        </div>

        <div className="space-y-3">
          {upcomingMatches.map((match) => (
            <MatchCard
              key={match.id}
              {...match}
              onViewDetails={() => {
                toast({
                  title: "Match Details",
                  description: `Viewing details for ${match.field}`,
                });
              }}
            />
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground mt-1">Games Played</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-rich">8.5</div>
            <div className="text-xs text-muted-foreground mt-1">Avg Fairness</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">92%</div>
            <div className="text-xs text-muted-foreground mt-1">Attendance</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
