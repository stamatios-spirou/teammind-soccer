import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/Match/MatchCard";
import { SearchingModal } from "@/components/AutoPlacement/SearchingModal";
import { Bell, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

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
          teams(
            id,
            team_members(id)
          )
        `)
        .eq('is_public', true)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3);

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

  const handleAutoPlace = () => {
    if (!selectedSlot) {
      toast({
        title: "Select a time slot",
        description: "Please choose when you'd like to play",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
  };

  const handlePlacementComplete = (result: any) => {
    setIsSearching(false);
    navigate('/placement-confirmed', { state: { result } });
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getPlayerCount = (match: any) => {
    if (!match.teams) return 0;
    return match.teams.reduce((sum: number, team: any) => 
      sum + (team.team_members?.length || 0), 0
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <header className="bg-gradient-to-b from-navy-dark to-background px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, User!</h1>
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => navigate('/matches')}
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No upcoming matches</div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                date={formatMatchDate(match.scheduled_at)}
                time={formatMatchTime(match.scheduled_at)}
                field={match.fields?.name || 'TBD'}
                playersCount={getPlayerCount(match)}
                maxPlayers={match.max_players}
                fairnessScore={match.fairness_score || 0}
                skillLevel={match.skill_level || 'intermediate'}
                gameType={match.match_type || 'casual'}
                onViewDetails={() => navigate(`/match/${match.id}`)}
              />
            ))}
          </div>
        )}
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

      {/* Auto-Placement Modal */}
      <SearchingModal
        isOpen={isSearching}
        onClose={() => setIsSearching(false)}
        onComplete={handlePlacementComplete}
        selectedTime={selectedSlot}
      />
    </div>
  );
};

export default Home;
