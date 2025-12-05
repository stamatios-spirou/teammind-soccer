import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, MapPin, Clock, Users, Target, TrendingUp, Star, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SearchingModal } from "@/components/AutoPlacement/SearchingModal";
import { format } from "date-fns";
import { toast } from "sonner";

interface MatchWithScore {
  id: string;
  field: string;
  fieldId: string | null;
  time: string;
  date: string;
  dateRaw: Date;
  role: string;
  playersCount: number;
  maxPlayers: number;
  matchScore: number;
  skillLevel: string;
  fairnessScore: number | null;
  positionAvailable: boolean;
}

const AutoPlace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendedMatch, setRecommendedMatch] = useState<MatchWithScore | null>(null);
  const [alternativeMatches, setAlternativeMatches] = useState<MatchWithScore[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);

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

  const calculateMatchScore = (
    match: any,
    userSkill: string,
    userPosition: string,
    userHomeFieldId: string | null
  ): number => {
    let score = 0;

    // +30% if skill level matches
    if (match.skill_level === userSkill) {
      score += 30;
    } else if (
      (match.skill_level === "intermediate" && userSkill !== "beginner") ||
      (match.skill_level === "beginner" && userSkill === "intermediate")
    ) {
      score += 15; // Partial match
    }

    // +40% if preferred position is open (mock check based on player count)
    const playerCount = match.teams?.reduce(
      (sum: number, team: any) => sum + (team.team_members?.length || 0),
      0
    ) || 0;
    const maxPerPosition = Math.floor((match.max_players || 14) / 8); // Rough estimate
    const positionAvailable = playerCount < (match.max_players || 14) - 2;
    if (positionAvailable) {
      score += 40;
    }

    // +20% if fairness score > 7
    if (match.fairness_score && match.fairness_score > 7) {
      score += 20;
    } else if (match.fairness_score && match.fairness_score > 5) {
      score += 10;
    }

    // +10% if this is user's home field
    if (userHomeFieldId && match.field_id === userHomeFieldId) {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const handleFindMatch = async () => {
    setIsSearching(true);
    setRecommendedMatch(null);
    setAlternativeMatches([]);
    setShowAlternatives(false);

    try {
      // Fetch all upcoming public matches
      const now = new Date();
      const { data: matches, error } = await supabase
        .from("matches")
        .select(`
          *,
          fields(id, name, location),
          teams(id, team_members(id))
        `)
        .eq("is_public", true)
        .gte("scheduled_at", now.toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(20);

      if (error) throw error;

      if (!matches || matches.length === 0) {
        toast.error("No matches available", {
          description: "There are no upcoming games to join right now.",
        });
        setIsSearching(false);
        return;
      }

      // Calculate scores for each match
      const scoredMatches: MatchWithScore[] = matches.map((match) => {
        const playerCount = match.teams?.reduce(
          (sum: number, team: any) => sum + (team.team_members?.length || 0),
          0
        ) || 0;

        const score = calculateMatchScore(
          match,
          userProfile?.skill_level || "intermediate",
          userProfile?.preferred_position || "midfielder",
          userProfile?.home_field_id || null
        );

        const matchDate = new Date(match.scheduled_at);

        return {
          id: match.id,
          field: match.fields?.name || "Unknown Field",
          fieldId: match.field_id,
          time: format(matchDate, "h:mm a"),
          date: format(matchDate, "EEE, MMM d"),
          dateRaw: matchDate,
          role: positionLabel(userProfile?.preferred_position || "midfielder"),
          playersCount: playerCount,
          maxPlayers: match.max_players || 14,
          matchScore: score,
          skillLevel: match.skill_level || "intermediate",
          fairnessScore: match.fairness_score,
          positionAvailable: playerCount < (match.max_players || 14) - 2,
        };
      });

      // Sort by score descending
      scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

      // Set best match and alternatives
      if (scoredMatches.length > 0) {
        setRecommendedMatch(scoredMatches[0]);
        setAlternativeMatches(scoredMatches.slice(1, 3));
      }

      toast.success("Match found!", {
        description: `We found a ${scoredMatches[0]?.matchScore}% match for you.`,
      });
    } catch (error: any) {
      toast.error("Error finding matches", {
        description: error.message,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    if (!user) {
      toast.error("Please sign in to join a match");
      return;
    }
    
    // Navigate to match details where they can join
    navigate(`/match/${matchId}`);
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
    <div className="min-h-screen bg-background p-4 pb-24">
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
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Fair Play: <span className="text-foreground">{userProfile.fair_play_rating?.toFixed(1) || "5.0"}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Win Rate: <span className="text-foreground">{((userProfile.win_rate || 0) * 100).toFixed(0)}%</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Match */}
      {recommendedMatch && (
        <div className="bg-card rounded-xl p-4 mb-4 border-2 border-primary shadow-glow-orange">
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
              <span>
                Role: <span className={`font-semibold ${recommendedMatch.positionAvailable ? "text-gold" : "text-muted-foreground"}`}>
                  {recommendedMatch.role}
                </span>
                {recommendedMatch.positionAvailable && (
                  <span className="ml-2 text-xs text-gold">(Available)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{recommendedMatch.playersCount}/{recommendedMatch.maxPlayers} players</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span>Skill Level: <span className="capitalize">{recommendedMatch.skillLevel}</span></span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleJoinMatch(recommendedMatch.id)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
            >
              Join Now
            </Button>
            {alternativeMatches.length > 0 && (
              <Button
                onClick={() => setShowAlternatives(!showAlternatives)}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10"
              >
                See {alternativeMatches.length} Other{alternativeMatches.length > 1 ? "s" : ""}
                {showAlternatives ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Alternative Matches */}
      {showAlternatives && alternativeMatches.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-muted-foreground">Other Options</h4>
          {alternativeMatches.map((match) => (
            <div
              key={match.id}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">{match.field}</span>
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                  {match.matchScore}% Match
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {match.date} at {match.time} • {match.playersCount}/{match.maxPlayers} players
              </div>
              <Button
                onClick={() => handleJoinMatch(match.id)}
                variant="outline"
                size="sm"
                className="w-full border-border hover:border-primary"
              >
                View Match
              </Button>
            </div>
          ))}
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
          onClick={() => {
            setRecommendedMatch(null);
            setAlternativeMatches([]);
            setShowAlternatives(false);
          }}
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
