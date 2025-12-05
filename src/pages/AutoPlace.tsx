import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, MapPin, Clock, Users, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SearchingModal } from "@/components/AutoPlacement/SearchingModal";

interface RecommendedMatch {
  id: string;
  field: string;
  time: string;
  date: string;
  role: string;
  playersCount: number;
  maxPlayers: number;
  matchScore: number;
}

const AutoPlace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendedMatch, setRecommendedMatch] = useState<RecommendedMatch | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (user) loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const handleFindMatch = () => {
    setIsSearching(true);
    
    // Simulate finding a match
    setTimeout(() => {
      setRecommendedMatch({
        id: "rec-1",
        field: "Lubetkin Field",
        time: "5:00 PM",
        date: "Today",
        role: userProfile?.preferred_position || "Midfielder",
        playersCount: 10,
        maxPlayers: 14,
        matchScore: 94,
      });
      setIsSearching(false);
    }, 3000);
  };

  const handlePlacementComplete = (result: any) => {
    setIsSearching(false);
    navigate("/placement-confirmed", { state: { result } });
  };

  const positionLabel = (pos: string) => {
    const labels: Record<string, string> = {
      goalkeeper: "Goalkeeper",
      defender: "Defender",
      midfielder: "Midfielder",
      forward: "Forward",
    };
    return labels[pos] || pos;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Zap className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">Auto Place Me</h1>
        <p className="text-muted-foreground">
          Find the perfect game based on your preferences
        </p>
      </div>

      {/* User Preferences Summary */}
      {userProfile && (
        <div className="bg-card rounded-xl p-4 mb-6 border border-border">
          <h3 className="font-semibold text-foreground mb-3">Your Preferences</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Position: <span className="text-foreground">{positionLabel(userProfile.preferred_position)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Skill: <span className="text-foreground capitalize">{userProfile.skill_level}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Match */}
      {recommendedMatch && (
        <div className="bg-card rounded-xl p-4 mb-6 border-2 border-primary shadow-glow-orange">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-primary uppercase tracking-wide">
              Best Match For You
            </span>
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              {recommendedMatch.matchScore}% Match
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{recommendedMatch.field}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{recommendedMatch.date} at {recommendedMatch.time}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span>Role: <span className="text-primary font-semibold">{recommendedMatch.role}</span></span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{recommendedMatch.playersCount}/{recommendedMatch.maxPlayers} players</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate(`/match/${recommendedMatch.id}`)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
            >
              Join Now
            </Button>
            <Button
              onClick={() => setShowMore(true)}
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/10"
            >
              See More
            </Button>
          </div>
        </div>
      )}

      {/* Find Match Button */}
      {!recommendedMatch && (
        <Button
          onClick={handleFindMatch}
          disabled={isSearching}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-lg font-bold shadow-glow-orange"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
              Finding Best Match...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Find My Perfect Game
            </>
          )}
        </Button>
      )}

      {/* Reset */}
      {recommendedMatch && (
        <Button
          onClick={() => setRecommendedMatch(null)}
          variant="ghost"
          className="w-full mt-4 text-muted-foreground"
        >
          Search Again
        </Button>
      )}

      {/* Searching Modal */}
      <SearchingModal
        isOpen={isSearching}
        onClose={() => setIsSearching(false)}
        onComplete={handlePlacementComplete}
        selectedTime="auto"
      />
    </div>
  );
};

export default AutoPlace;