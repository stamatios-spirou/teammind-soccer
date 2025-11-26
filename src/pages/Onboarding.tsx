import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFinish = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone,
          skill_level: skillLevel as 'beginner' | 'intermediate' | 'advanced',
          preferred_position: position as 'goalkeeper' | 'defender' | 'midfielder' | 'forward',
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Add role if not player (player is default)
      if (role !== 'player') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: user.id, 
            role: role as 'captain' | 'staff' 
          });

        if (roleError && roleError.code !== '23505') {
          throw roleError;
        }
      }

      toast({
        title: 'Profile completed!',
        description: 'Welcome to TeamMind',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-navy-dark to-background px-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-16 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {step} of 3
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Role</h2>
              <p className="text-muted-foreground">How do you want to use TeamMind?</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'player', label: 'Player', desc: 'Join and play in matches' },
                { value: 'captain', label: 'Captain', desc: 'Create and organize matches' },
                { value: 'staff', label: 'Campus Staff', desc: 'Manage fields and view analytics' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    role === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!role}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Skill & Position */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Profile</h2>
              <p className="text-muted-foreground">Tell us about your play style</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="position">Preferred Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                    <SelectItem value="defender">Defender</SelectItem>
                    <SelectItem value="midfielder">Midfielder</SelectItem>
                    <SelectItem value="forward">Forward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!skillLevel || !position}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Contact Info</h2>
              <p className="text-muted-foreground">Stay connected with your teams</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-muted border-border"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Setting up...' : 'Finish'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
