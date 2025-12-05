import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, MapPin, Clock, Users, Target, TrendingUp, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Easy to update field options
const FIELD_OPTIONS = [
  { value: "lubetkin", label: "Lubetkin Field at Mal Simon Stadium" },
  { value: "frederick-douglass", label: "Frederick Douglass Field (NJIT Newark)" },
];

// Easy to update time slots
const TIME_OPTIONS = [
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:30", label: "7:30 PM" },
  { value: "21:00", label: "9:00 PM" },
];

interface PlacementResult {
  field: string;
  time: string;
  role: string;
  playersCount: number;
  maxPlayers: number;
}

const AutoPlace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null);

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

  const getFieldLabel = (value: string) => {
    return FIELD_OPTIONS.find(f => f.value === value)?.label || value;
  };

  const getTimeLabel = (value: string) => {
    return TIME_OPTIONS.find(t => t.value === value)?.label || value;
  };

  const handleAutoPlace = async () => {
    if (!selectedField || !selectedTime) return;

    setIsPlacing(true);
    setPlacementResult(null);

    // Simulate auto placement logic with the selected field and time
    // In production, this would call your backend with these parameters
    setTimeout(() => {
      const result: PlacementResult = {
        field: getFieldLabel(selectedField),
        time: getTimeLabel(selectedTime),
        role: userProfile?.preferred_position 
          ? positionLabel(userProfile.preferred_position) 
          : "Midfielder",
        playersCount: Math.floor(Math.random() * 6) + 8, // 8-13 players
        maxPlayers: 14,
      };

      setPlacementResult(result);
      setIsPlacing(false);

      toast({
        title: "Players Auto-Placed!",
        description: `Players auto-placed for ${result.field} at ${result.time}`,
      });
    }, 2000);
  };

  const handleReset = () => {
    setPlacementResult(null);
    setSelectedField("");
    setSelectedTime("");
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

  const isButtonEnabled = selectedField && selectedTime && !isPlacing;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">Auto Place Players</h1>
        <p className="text-muted-foreground text-sm">
          Choose a field and time, then run auto balance
        </p>
      </div>

      {/* Selection Dropdowns */}
      <div className="space-y-4 mb-6">
        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <MapPin className="w-4 h-4 inline mr-2 text-primary" />
            Field Selection
          </label>
          <Select value={selectedField} onValueChange={setSelectedField}>
            <SelectTrigger className="w-full h-12 bg-card border-border text-foreground">
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {FIELD_OPTIONS.map((field) => (
                <SelectItem 
                  key={field.value} 
                  value={field.value}
                  className="text-foreground hover:bg-primary/10"
                >
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Clock className="w-4 h-4 inline mr-2 text-primary" />
            Time Selection
          </label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-full h-12 bg-card border-border text-foreground">
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {TIME_OPTIONS.map((time) => (
                <SelectItem 
                  key={time.value} 
                  value={time.value}
                  className="text-foreground hover:bg-primary/10"
                >
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Preferences Summary */}
      {userProfile && (
        <div className="bg-card rounded-xl p-4 mb-6 border border-border">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Your Preferences</h3>
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
          </div>
        </div>
      )}

      {/* Placement Result */}
      {placementResult && (
        <div className="bg-card rounded-xl p-4 mb-6 border-2 border-green-500/50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-foreground">Placement Complete</span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{placementResult.field}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{placementResult.time}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span>Your Role: <span className="text-primary font-semibold">{placementResult.role}</span></span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{placementResult.playersCount}/{placementResult.maxPlayers} players placed</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto Place Button */}
      <Button
        onClick={handleAutoPlace}
        disabled={!isButtonEnabled}
        className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-lg font-bold shadow-glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPlacing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
            Auto Placing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Auto Place
          </>
        )}
      </Button>

      {/* Helper text when button is disabled */}
      {(!selectedField || !selectedTime) && !placementResult && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Select both a field and time to enable auto placement
        </p>
      )}

      {/* Reset Button */}
      {placementResult && (
        <Button
          onClick={handleReset}
          variant="ghost"
          className="w-full mt-4 text-muted-foreground"
        >
          Start Over
        </Button>
      )}
    </div>
  );
};

export default AutoPlace;
