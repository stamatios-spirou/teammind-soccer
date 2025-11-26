import { useState } from "react";
import { MatchCard } from "@/components/Match/MatchCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const allMatches = [
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
  {
    id: "4",
    date: "Saturday",
    time: "4:00 PM",
    field: "Field A - Main Campus",
    playersCount: 10,
    maxPlayers: 14,
    fairnessScore: 9,
    skillLevel: "Intermediate",
    gameType: "competitive" as const,
  },
  {
    id: "5",
    date: "Sunday",
    time: "3:00 PM",
    field: "Field D - East Campus",
    playersCount: 4,
    maxPlayers: 12,
    fairnessScore: 6,
    skillLevel: "Beginner",
    gameType: "casual" as const,
  },
];

const Matches = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters = [
    { id: "today", label: "Today" },
    { id: "casual", label: "Casual" },
    { id: "competitive", label: "Competitive" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div className="min-h-screen pt-6 px-4 pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Browse Matches</h1>
        <p className="text-muted-foreground">Find your perfect game</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Button variant="outline" size="sm" className="rounded-full shrink-0">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        {filters.map((filter) => (
          <Badge
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            className="cursor-pointer rounded-full px-4 py-1.5 shrink-0"
            onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
          >
            {filter.label}
          </Badge>
        ))}
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {allMatches.map((match) => (
          <MatchCard
            key={match.id}
            {...match}
            onViewDetails={() => console.log("View details:", match.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Matches;
