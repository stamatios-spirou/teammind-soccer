import { MapPin, Clock, Users } from "lucide-react";
import { PositionBar } from "./PositionBar";
import { useNavigate } from "react-router-dom";

interface MatchPreviewCardProps {
  id: string;
  field: string;
  time: string;
  playersCount: number;
  maxPlayers: number;
  gameType: string;
  positions: {
    gk: { filled: number; max: number };
    def: { filled: number; max: number };
    mid: { filled: number; max: number };
    fwd: { filled: number; max: number };
  };
  userPreferredPosition?: string;
}

export const MatchPreviewCard = ({
  id,
  field,
  time,
  playersCount,
  maxPlayers,
  gameType,
  positions,
  userPreferredPosition,
}: MatchPreviewCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/match/${id}`)}
      className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <MapPin className="w-4 h-4" />
            <span>{field}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Clock className="w-4 h-4 text-primary" />
            <span>{time}</span>
          </div>
        </div>
        
        <div className="text-right">
          <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded-md">
            {gameType}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PositionBar positions={positions} userPreferredPosition={userPreferredPosition} />
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            <span className="text-foreground">{playersCount}</span>/{maxPlayers}
          </span>
        </div>
      </div>
    </div>
  );
};