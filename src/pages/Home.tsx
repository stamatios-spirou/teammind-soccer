import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/Home/HeroSection";
import { LiveStats } from "@/components/Home/LiveStats";
import { MatchPreviewCard } from "@/components/Home/MatchPreviewCard";
import { Calendar, MapPin, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { toast } from "sonner";

interface MatchData {
  id: string;
  scheduled_at: string;
  max_players: number;
  match_type: string;
  skill_level: string;
  fields?: { name: string; location: string };
  teams?: Array<{ id: string; team_members?: Array<{ id: string }> }>;
}

const NJIT_FIELDS = [
  { name: "Lubetkin Field", location: "100 Lock Street, Newark, NJ 07102" },
  { name: "Frederick Douglass Field", location: "42 Warren Street, Newark, NJ 07102" },
];

const Home = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadMatches();
    if (user) loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("preferred_position")
      .eq("id", user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const loadMatches = async () => {
    try {
      const now = new Date();
      const sevenDaysLater = addDays(now, 7);

      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          fields(name, location),
          teams(
            id,
            team_members(id)
          )
        `)
        .eq("is_public", true)
        .gte("scheduled_at", now.toISOString())
        .lte("scheduled_at", sevenDaysLater.toISOString())
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast.error("Error loading matches", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlayerCount = (match: MatchData) => {
    if (!match.teams) return 0;
    return match.teams.reduce((sum, team) => sum + (team.team_members?.length || 0), 0);
  };

  const getGameType = (maxPlayers: number) => {
    if (maxPlayers <= 14) return "7v7";
    if (maxPlayers <= 18) return "9v9";
    return "11v11";
  };

  const generateMockPositions = (matchId: string, maxPlayers: number) => {
    const seed = matchId.charCodeAt(0) + matchId.charCodeAt(1);
    const perTeam = Math.floor(maxPlayers / 2);
    
    return {
      gk: { filled: seed % 2, max: 1 },
      def: { filled: (seed % 3) + 1, max: Math.max(2, Math.floor(perTeam * 0.3)) },
      mid: { filled: (seed % 4) + 1, max: Math.max(2, Math.floor(perTeam * 0.4)) },
      fwd: { filled: seed % 2, max: Math.max(1, Math.floor(perTeam * 0.3)) },
    };
  };

  const formatMatchTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  // Group matches by day
  const groupMatchesByDay = () => {
    const groups: { [key: string]: MatchData[] } = {};
    const today = startOfDay(new Date());

    for (let i = 0; i < 7; i++) {
      const day = addDays(today, i);
      const dayKey = format(day, "yyyy-MM-dd");
      groups[dayKey] = [];
    }

    matches.forEach((match) => {
      const matchDate = startOfDay(new Date(match.scheduled_at));
      const dayKey = format(matchDate, "yyyy-MM-dd");
      if (groups[dayKey]) {
        groups[dayKey].push(match);
      }
    });

    return groups;
  };

  const getDayLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, tomorrow)) return "Tomorrow";
    return format(date, "EEEE, MMM d");
  };

  const matchesByDay = groupMatchesByDay();

  // Check for "forming match" opportunities (mock - would need a proper interest tracking system)
  const formingOpportunities = [
    { time: "5:00 PM", playersInterested: 11, date: "Today" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <HeroSection />

      {/* Live Stats */}
      <LiveStats />

      {/* NJIT Badge */}
      <div className="px-4 mt-4">
        <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 flex items-center justify-center gap-2">
          <span className="text-primary font-semibold text-sm">
            🎓 NJIT Players Active on TeamMind
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-4 flex gap-3">
        <Button
          onClick={() => navigate("/matches")}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-bold shadow-glow-orange"
        >
          <Calendar className="w-5 h-5 mr-2" />
          View Matches
        </Button>
        <Button
          onClick={() => navigate("/fields")}
          variant="outline"
          className="flex-1 border-primary text-primary hover:bg-primary/10 h-12 rounded-xl font-bold"
        >
          <MapPin className="w-5 h-5 mr-2" />
          View Fields
        </Button>
      </div>

      {/* Forming Match Opportunities */}
      {formingOpportunities.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold" />
            Open Game Opportunities
          </h2>
          {formingOpportunities.map((opp, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-gold/20 to-primary/20 border border-gold/30 rounded-xl p-4 mb-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">
                    {opp.playersInterested} Players want a game at {opp.time}
                  </p>
                  <p className="text-sm text-muted-foreground">{opp.date}</p>
                </div>
                <Button
                  onClick={() => navigate("/create-match")}
                  size="sm"
                  className="bg-gold text-charcoal-dark hover:bg-gold/90 font-bold"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Create Match
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Matches by Day */}
      <section className="px-4 py-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Games</h2>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading matches...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(matchesByDay).map(([dayKey, dayMatches]) => (
              <div key={dayKey}>
                <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                  {getDayLabel(dayKey)}
                </h3>

                {dayMatches.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-2">No games scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {dayMatches.map((match) => (
                      <MatchPreviewCard
                        key={match.id}
                        id={match.id}
                        field={match.fields?.name || NJIT_FIELDS[0].name}
                        time={formatMatchTime(match.scheduled_at)}
                        playersCount={getPlayerCount(match)}
                        maxPlayers={match.max_players || 14}
                        gameType={getGameType(match.max_players || 14)}
                        positions={generateMockPositions(match.id, match.max_players || 14)}
                        userPreferredPosition={userProfile?.preferred_position}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
