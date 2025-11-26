import { MapPin, Users, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  id: string;
  date: string;
  time: string;
  field: string;
  playersCount: number;
  maxPlayers: number;
  fairnessScore: number;
  skillLevel: string;
  gameType: "casual" | "competitive";
  onViewDetails: () => void;
}

export const MatchCard = ({
  date,
  time,
  field,
  playersCount,
  maxPlayers,
  fairnessScore,
  skillLevel,
  gameType,
  onViewDetails,
}: MatchCardProps) => {
  const getFairnessColor = (score: number) => {
    if (score >= 8) return "text-green-electric";
    if (score >= 6) return "text-blue-rich";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">{date}</span>
            <span className="text-sm text-muted-foreground">at {time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{field}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {playersCount}/{maxPlayers}
              </span>
            </div>

            <Badge variant="outline" className="badge-skill">
              {skillLevel}
            </Badge>

            {gameType === "competitive" && (
              <Badge variant="outline" className="badge-skill border-blue-rich text-blue-rich">
                <Trophy className="w-3 h-3" />
                Competitive
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Fairness Score:</span>
            <span className={`text-sm font-bold ${getFairnessColor(fairnessScore)}`}>
              {fairnessScore}/10
            </span>
          </div>
        </div>

        <Button
          onClick={onViewDetails}
          size="sm"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-4"
        >
          Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
