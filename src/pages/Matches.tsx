import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MatchCard } from "@/components/Match/MatchCard";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Matches = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          fields(name, location),
          teams(id, team_members(id))
        `)
        .eq('is_public', true)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading matches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getPlayerCount = (match: any) => {
    if (!match.teams) return 0;
    return match.teams.reduce((sum: number, team: any) => sum + (team.team_members?.length || 0), 0);
  };

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
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No matches found</div>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              id={match.id}
              date={formatDate(match.scheduled_at)}
              time={formatTime(match.scheduled_at)}
              field={match.fields?.name || 'TBD'}
              playersCount={getPlayerCount(match)}
              maxPlayers={match.max_players}
              fairnessScore={match.fairness_score || 0}
              skillLevel={match.skill_level || 'intermediate'}
              gameType={match.match_type || 'casual'}
              onViewDetails={() => navigate(`/match/${match.id}`)}
            />
          ))
        )}
      </div>

      {/* Floating Action Button for Captains */}
      <Button
        onClick={() => navigate('/create-match')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Matches;
