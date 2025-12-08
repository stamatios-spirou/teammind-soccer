import { Search, Users, Trophy } from "lucide-react";

interface LiveStatsProps {
  playersLooking: number;
  communityMembers: number;
  gamesToday: number;
}

export const LiveStats = ({ playersLooking, communityMembers, gamesToday }: LiveStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 -mt-6 relative z-20">
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{playersLooking}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-tight">Players Looking</p>
      </div>
      
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{communityMembers}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-tight">Community Members</p>
      </div>
      
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{gamesToday}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-tight">Games Today</p>
      </div>
    </div>
  );
};