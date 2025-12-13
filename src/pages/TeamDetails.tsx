import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Users, LogOut, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  user_id: string;
  assigned_position: string | null;
  is_captain: boolean;
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
  match_id: string;
  team_members: TeamMember[];
}

interface Match {
  id: string;
  scheduled_at: string;
  max_players: number;
  match_type: string;
  skill_level: string;
  fields: {
    name: string;
    location: string;
  } | null;
}

const TeamDetails = () => {
  const { matchId, teamId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [otherTeam, setOtherTeam] = useState<Team | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    loadTeamDetails();
  }, [matchId, teamId]);

  const loadTeamDetails = async () => {
    if (!matchId || !teamId) return;

    try {
      // Load match info
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          scheduled_at,
          max_players,
          match_type,
          skill_level,
          fields(name, location)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Load this team with members
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          color,
          match_id,
          team_members(
            id,
            user_id,
            assigned_position,
            is_captain,
            profiles(full_name, skill_level, preferred_position)
          )
        `)
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // Load other team for comparison (just count)
      const { data: otherTeamData } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          color,
          match_id,
          team_members(id)
        `)
        .eq('match_id', matchId)
        .neq('id', teamId)
        .maybeSingle();

      if (otherTeamData) {
        setOtherTeam({
          id: otherTeamData.id,
          name: otherTeamData.name,
          color: otherTeamData.color,
          match_id: otherTeamData.match_id,
          team_members: otherTeamData.team_members as any || []
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error loading team',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !teamId) return;

    setLeaving(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Left team',
        description: 'You have left the team.',
      });

      navigate(`/match/${matchId}`);
    } catch (error: any) {
      toast({
        title: 'Error leaving team',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team || !match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-foreground">Team not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const scheduledDate = new Date(match.scheduled_at);
  const teamSize = Math.floor(match.max_players / 2);
  const currentMembers = team.team_members.length;
  const isUserOnTeam = team.team_members.some(m => m.user_id === user?.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/match/${matchId}`)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
            <p className="text-sm text-muted-foreground">
              {currentMembers}/{teamSize} players
            </p>
          </div>
          <div
            className="w-6 h-6 rounded-full border-2 border-border"
            style={{ backgroundColor: team.color }}
          />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Match Info */}
        <Card className="p-4 bg-card space-y-2">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {scheduledDate.toLocaleDateString()} at{' '}
              {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>{match.fields?.name || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-5 h-5" />
            <span>
              {currentMembers + (otherTeam?.team_members?.length || 0)}/{match.max_players} total
            </span>
          </div>
        </Card>

        {/* Team Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: `${team.color}20`, borderColor: team.color, borderWidth: 2 }}
          >
            <p className="font-bold text-foreground">{team.name}</p>
            <p className="text-2xl font-black text-foreground">{currentMembers}</p>
            <p className="text-xs text-muted-foreground">players</p>
          </div>
          {otherTeam && (
            <div 
              className="p-4 rounded-xl text-center bg-muted/30 border-2 border-muted"
            >
              <p className="font-bold text-muted-foreground">{otherTeam.name}</p>
              <p className="text-2xl font-black text-muted-foreground">
                {otherTeam.team_members?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">players</p>
            </div>
          )}
        </div>

        {/* Team Roster */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Team Roster</h2>
          
          {team.team_members.length === 0 ? (
            <Card className="p-6 bg-card text-center">
              <p className="text-muted-foreground">No players yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {team.team_members.map((member) => (
                <Card 
                  key={member.id} 
                  className={`p-3 bg-card flex items-center gap-3 ${
                    member.user_id === user?.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-muted text-sm font-semibold">
                      {member.profiles.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {member.profiles.full_name || 'Unknown Player'}
                      </p>
                      {member.user_id === user?.id && (
                        <Badge className="bg-primary text-primary-foreground text-xs">You</Badge>
                      )}
                      {member.is_captain && (
                        <Badge variant="outline" className="text-xs">Captain</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.assigned_position || member.profiles.preferred_position || 'Any position'}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {member.profiles.skill_level || 'Intermediate'}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate(`/chat?match=${matchId}&team=${teamId}`)}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Team Chat
          </Button>
          
          {isUserOnTeam && (
            <Button
              variant="outline"
              onClick={handleLeaveTeam}
              disabled={leaving}
              className="w-full h-12 text-destructive border-destructive hover:bg-destructive/10"
            >
              {leaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 mr-2" />
                  Leave Team
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;