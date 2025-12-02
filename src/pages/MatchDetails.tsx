import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [match, setMatch] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTeam, setUserTeam] = useState<string | null>(null);

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
        const myTeam = teamsData.find((team: any) =>
          team.team_members.some((member: any) => member.user_id === user.id)
        );
        setUserTeam(myTeam?.id || null);
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
    if (!user || !id) return;

    try {
      const { error } = await supabase
        .from('match_participants')
        .insert({ match_id: id, user_id: user.id, status: 'joined' });

      if (error) throw error;

      toast({
        title: 'Joined match!',
        description: 'You will be assigned to a team shortly.',
      });
      
      loadMatchDetails();
    } catch (error: any) {
      toast({
        title: 'Error joining match',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Match not found</div>
      </div>
    );
  }

  const scheduledDate = new Date(match.scheduled_at);

  return (
    <div className="min-h-screen bg-background">
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
              {teams.reduce((sum, team) => sum + team.team_members.length, 0)}/{match.max_players} players
            </span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="badge-skill">
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
                <Card key={team.id} className="p-4 bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <h3 className="font-bold text-foreground">{team.name}</h3>
                    {team.id === userTeam && (
                      <Badge className="ml-auto bg-primary text-primary-foreground">You</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {team.team_members.map((member: any) => (
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
                          <div className="text-xs text-muted-foreground">
                            {member.assigned_position || member.profiles.preferred_position}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {member.profiles.skill_level}
                        </Badge>
                      </div>
                    ))}
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
            >
              Join Match
            </Button>
          ) : (
            <Button
              onClick={() => navigate(`/chat?match=${id}&team=${userTeam}`)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
            >
              Go to Team Chat
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
