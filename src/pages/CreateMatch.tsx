import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const CreateMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('14');
  const [skillLevel, setSkillLevel] = useState<string>('intermediate');
  const [matchType, setMatchType] = useState<string>('casual');
  const [isPublic, setIsPublic] = useState(true);
  const [autoBalance, setAutoBalance] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`);

      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          field_id: fieldId || null,
          scheduled_at: scheduledAt.toISOString(),
          match_type: matchType as 'casual' | 'competitive',
          skill_level: skillLevel as 'beginner' | 'intermediate' | 'advanced',
          max_players: parseInt(maxPlayers),
          is_public: isPublic,
          auto_balance: autoBalance,
          created_by: user.id,
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Create two teams
      if (autoBalance && matchData) {
        const { error: teamsError } = await supabase
          .from('teams')
          .insert([
            { match_id: matchData.id, name: 'Team A', color: '#3B82F6' },
            { match_id: matchData.id, name: 'Team B', color: '#0EEA4A' },
          ]);

        if (teamsError) throw teamsError;
      }

      toast({
        title: 'Match created!',
        description: 'Your match has been created successfully.',
      });

      navigate(`/match/${matchData.id}`);
    } catch (error: any) {
      toast({
        title: 'Error creating match',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Create Match</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-4 bg-card space-y-4">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-muted border-border"
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-muted border-border"
                  required
                />
              </div>
            </div>

            {/* Field Selection */}
            <div>
              <Label htmlFor="field">Field (Optional)</Label>
              <Select value={fieldId} onValueChange={setFieldId}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">TBD</SelectItem>
                  {/* These will be populated from the database */}
                </SelectContent>
              </Select>
            </div>

            {/* Max Players */}
            <div>
              <Label htmlFor="maxPlayers">Maximum Players</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                min="6"
                max="22"
                className="bg-muted border-border"
                required
              />
            </div>

            {/* Skill Level */}
            <div>
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Match Type */}
            <div>
              <Label htmlFor="matchType">Match Type</Label>
              <Select value={matchType} onValueChange={setMatchType}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public">Public Match</Label>
                  <p className="text-xs text-muted-foreground">Anyone can join</p>
                </div>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBalance">Auto-Balance Teams</Label>
                  <p className="text-xs text-muted-foreground">AI will balance teams</p>
                </div>
                <Switch
                  id="autoBalance"
                  checked={autoBalance}
                  onCheckedChange={setAutoBalance}
                />
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg rounded-xl"
          >
            {loading ? 'Creating...' : 'Create Game and Balance Teams'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateMatch;
