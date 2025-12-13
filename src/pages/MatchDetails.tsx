import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  user_id: string;
  assigned_position: string | null;
  profiles: {
    full_name: string | null;
    skill_level: string | null;
    preferred_position: string | null;
  };
}

interface Team {
  id: string;
  name: string;
  color: string;
  team_members: TeamMember[];
}

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [match, setMatch] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userTeam, setUserTeam] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadMatchDetails();
  }, [id, user]);

  const loadMatchDetails = async () => {
    if (!id) return;

    try {
      // Load match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          fields(name, location),
          profiles:created_by(full_name)
        `)
        .eq('id', id)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Load teams with members
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(
            *,
            profiles(full_name, skill_level, preferred_position)
          )
        `)
        .eq('match_id', id);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Check if user is in a team
      if (user && teamsData) {
        const myTeam = teamsData.find((team: Team) =>
          team.team_members.some((member: TeamMember) => member.user_id === user.id)
        );
        setUserTeam(myTeam ? { id: myTeam.id, name: myTeam.name } : null);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading match',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMatch = async () => {
    if (!user) {
      toast({ title: 'Please sign in to join', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!id || teams.length < 2) {
      toast({ title: 'Teams not ready yet', variant: 'destructive' });
      return;
    }

    setJoining(true);
    try {
      // Find team with fewer members
      const teamA = teams[0];
      const teamB = teams[1];
      
      const teamACount = teamA.team_members.length;
      const teamBCount = teamB.team_members.length;
      
      // Assign to smaller team, random if tied
      let selectedTeam: Team;
      if (teamACount < teamBCount) {
        selectedTeam = teamA;
      } else if (teamBCount < teamACount) {
        selectedTeam = teamB;
      } else {
        // Tied - random selection
        selectedTeam = Math.random() < 0.5 ? teamA : teamB;
      }

      // Check team capacity (max_players / 2)
      const teamSize = Math.floor((match?.max_players || 14) / 2);
      if (selectedTeam.team_members.length >= teamSize) {
        // Try other team
        const otherTeam = selectedTeam.id === teamA.id ? teamB : teamA;
        if (otherTeam.team_members.length >= teamSize) {
          toast({ title: 'Match is full', variant: 'destructive' });
          setJoining(false);
          return;
        }
        selectedTeam = otherTeam;
      }

      // Insert into team_members
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: selectedTeam.id,
          user_id: user.id,
          is_captain: false,
        });

      if (error) throw error;

      toast({
        title: `Joined ${selectedTeam.name}!`,
        description: 'Welcome to the team.',
      });

      // Navigate to team page
      navigate(`/match/${id}/team/${selectedTeam.id}`);
    } catch (error: any) {
      toast({
        title: 'Error joining match',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-foreground text-lg">Game not found</p>
        <Button onClick={() => navigate('/fields')}>Back to Map</Button>
      </div>
    );
  }

  const scheduledDate = new Date(match.scheduled_at);
  const totalPlayers = teams.reduce((sum, team) => sum + team.team_members.length, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Match Details</h1>
          </div>
          {match.fairness_score && (
            <Badge variant="outline" className="badge-skill">
              Fairness: {match.fairness_score}/10
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Match Info Card */}
        <Card className="p-4 bg-card space-y-3">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>{match.fields?.name || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">
              {totalPlayers}/{match.max_players} players
            </span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="badge-skill capitalize">
              {match.skill_level}
            </Badge>
            {match.match_type === 'competitive' && (
              <Badge variant="outline" className="badge-skill border-blue-rich text-blue-rich">
                <Trophy className="w-3 h-3 mr-1" />
                Competitive
              </Badge>
            )}
          </div>
        </Card>

        {/* Teams */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Teams</h2>
          
          {teams.length === 0 ? (
            <Card className="p-6 bg-card text-center">
              <p className="text-muted-foreground">Teams not yet assigned</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <Card 
                  key={team.id} 
                  className={`p-4 bg-card cursor-pointer hover:bg-muted/50 transition-colors ${
                    userTeam?.id === team.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => navigate(`/match/${id}/team/${team.id}`)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <h3 className="font-bold text-foreground">{team.name}</h3>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {team.team_members.length}/{Math.floor(match.max_players / 2)}
                    </span>
                    {userTeam?.id === team.id && (
                      <Badge className="bg-primary text-primary-foreground">You</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {team.team_members.slice(0, 4).map((member: TeamMember) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-muted text-xs">
                            {member.profiles.full_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {member.profiles.full_name || 'User'}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {member.assigned_position || member.profiles.preferred_position}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {member.profiles.skill_level}
                        </Badge>
                      </div>
                    ))}
                    {team.team_members.length > 4 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        +{team.team_members.length - 4} more
                      </p>
                    )}
                    {team.team_members.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No players yet
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!userTeam ? (
            <Button
              onClick={handleJoinMatch}
              disabled={joining || teams.length < 2}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Game'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => navigate(`/match/${id}/team/${userTeam.id}`)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
            >
              View {userTeam.name}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full h-12"
          >
            Add to Calendar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
