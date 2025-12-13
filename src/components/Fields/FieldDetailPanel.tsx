import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Clock, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Field {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  activePlayers: number;
  isForming: boolean;
  upcomingGames: number;
}

interface MatchData {
  id: string;
  scheduled_at: string;
  match_type: string;
  max_players: number;
  current_players: number;
  skill_level: string;
}

interface FieldDetailPanelProps {
  field: Field | null;
  onClose: () => void;
}

const FieldDetailPanel: React.FC<FieldDetailPanelProps> = ({ field, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [formingMatch, setFormingMatch] = useState<MatchData | null>(null);

  // Fetch matches for this field
  useEffect(() => {
    if (!field) return;

    const fetchMatches = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      const tomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      // First get real fields from DB that match this field name
      const { data: dbFields } = await supabase
        .from('fields')
        .select('id')
        .ilike('name', `%${field.name.split(' ')[0]}%`);

      const fieldIds = dbFields?.map(f => f.id) || [];

      if (fieldIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          id,
          scheduled_at,
          match_type,
          max_players,
          skill_level,
          field_id,
          match_participants(id)
        `)
        .in('field_id', fieldIds)
        .gte('scheduled_at', now)
        .lte('scheduled_at', tomorrow)
        .order('scheduled_at', { ascending: true });

      if (!error && matchesData) {
        const formattedMatches = matchesData.map(m => ({
          id: m.id,
          scheduled_at: m.scheduled_at,
          match_type: m.match_type || 'casual',
          max_players: m.max_players || 14,
          current_players: m.match_participants?.length || 0,
          skill_level: m.skill_level || 'intermediate'
        }));
        setMatches(formattedMatches);
        
        // Find a forming match (not full yet)
        const forming = formattedMatches.find(m => m.current_players < m.max_players && m.current_players >= 6);
        setFormingMatch(forming || null);
      }
      setLoading(false);
    };

    fetchMatches();

    // Real-time subscription for match participants
    const channel = supabase
      .channel(`field-matches-${field.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants',
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [field]);

  const handleJoinMatch = async (matchId: string) => {
    if (!user) {
      toast.error('Please sign in to join a match');
      navigate('/auth');
      return;
    }

    setJoining(matchId);
    
    // Check if already joined
    const { data: existing } = await supabase
      .from('match_participants')
      .select('id')
      .eq('match_id', matchId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      toast.info('You\'re already in this match!');
      setJoining(null);
      navigate(`/match/${matchId}`);
      return;
    }

    const { error } = await supabase
      .from('match_participants')
      .insert({
        match_id: matchId,
        user_id: user.id,
        status: 'confirmed'
      });

    if (error) {
      toast.error('Failed to join match');
      console.error(error);
    } else {
      toast.success('You\'ve joined the match!');
      onClose();
      navigate(`/match/${matchId}`);
    }
    setJoining(null);
  };

  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;
    return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  };

  const getMatchFormat = (maxPlayers: number) => {
    if (maxPlayers <= 14) return '7v7';
    if (maxPlayers <= 18) return '9v9';
    return '11v11';
  };

  const openDirections = () => {
    if (!field) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${field.latitude},${field.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {field && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-10"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-20 bg-card rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="px-6 pb-8 space-y-5 overflow-y-auto max-h-[calc(70vh-3rem)]">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{field.name}</h2>
                  {(field.isForming || formingMatch) && (
                    <Badge className="bg-green-500 text-white animate-pulse">
                      Game Forming
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{field.address}</span>
                </div>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{field.activePlayers}</p>
                  <p className="text-xs text-muted-foreground">Active Now</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{matches.length || field.upcomingGames}</p>
                  <p className="text-xs text-muted-foreground">Games Today</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">22</p>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                </div>
              </div>

              {/* Forming Game Alert */}
              {formingMatch && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-500">
                        {formingMatch.current_players}/{formingMatch.max_players} Players — Forming Now
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatMatchTime(formingMatch.scheduled_at)} • {getMatchFormat(formingMatch.max_players)}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              )}

              {/* Upcoming Games */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Upcoming Games</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : matches.length > 0 ? (
                  <div className="space-y-2">
                    {matches.slice(0, 3).map((match) => (
                      <div 
                        key={match.id} 
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/match/${match.id}`)}
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {formatMatchTime(match.scheduled_at)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getMatchFormat(match.max_players)} {match.match_type} • {match.current_players}/{match.max_players} players
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming games at this field
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {formingMatch ? (
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600"
                    onClick={() => handleJoinMatch(formingMatch.id)}
                    disabled={joining === formingMatch.id}
                  >
                    {joining === formingMatch.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Forming Game'
                    )}
                  </Button>
                ) : matches.length > 0 ? (
                  <Button 
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => handleJoinMatch(matches[0].id)}
                    disabled={joining === matches[0].id}
                  >
                    {joining === matches[0].id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      `Join Next Game (${matches[0].current_players}/${matches[0].max_players})`
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => navigate('/matches')}
                  >
                    View All Games
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base"
                  onClick={openDirections}
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FieldDetailPanel;
