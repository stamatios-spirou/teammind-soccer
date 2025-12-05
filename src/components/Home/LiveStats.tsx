import { Users, Trophy, MapPin } from "lucide-react";

interface LiveStatsProps {
  playersOnline: number;
  gamesToday: number;
  fieldsAvailable: number;
}

export const LiveStats = ({ playersOnline, gamesToday, fieldsAvailable }: LiveStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 -mt-6 relative z-20">
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{playersOnline}</span>
        </div>
        <p className="text-xs text-muted-foreground">Online Now</p>
      </div>
      
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{gamesToday}</span>
        </div>
        <p className="text-xs text-muted-foreground">Games Today</p>
      </div>
      
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{fieldsAvailable}</span>
        </div>
        <p className="text-xs text-muted-foreground">Fields Open</p>
      </div>
    </div>
  );
};