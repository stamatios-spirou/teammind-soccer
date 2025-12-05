import { useState, useEffect } from "react";
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Target, Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const settingsOptions = [
  {
    icon: User,
    label: "Profile",
    description: "Update your information",
    section: "account",
  },
  {
    icon: Bell,
    label: "Notifications",
    description: "Manage your alerts",
    section: "account",
  },
  {
    icon: Shield,
    label: "Privacy & Security",
    description: "Control your data",
    section: "account",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    description: "Get assistance",
    section: "support",
  },
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPosition, setEditingPosition] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setSelectedPosition(data?.preferred_position || "midfielder");
    } catch (error: any) {
      toast.error("Error loading profile", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePosition = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          preferred_position: selectedPosition as any,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, preferred_position: selectedPosition });
      setEditingPosition(false);
      toast.success("Position updated!", {
        description: "Your Auto-Place results will now reflect this change.",
      });
    } catch (error: any) {
      toast.error("Error updating position", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "??";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 px-4 pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 px-4 pb-24">
      {/* Profile Header */}
      <Card className="p-6 bg-card mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {profile?.full_name || "Player"}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="badge-skill">
                {positionLabel(profile?.preferred_position || "midfielder")}
              </Badge>
              <Badge variant="outline" className="badge-skill border-primary text-primary capitalize">
                {profile?.skill_level || "intermediate"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{profile?.games_played || 0}</div>
            <div className="text-xs text-muted-foreground">Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {profile?.fair_play_rating?.toFixed(1) || "5.0"}
            </div>
            <div className="text-xs text-muted-foreground">Fair Play</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {((profile?.attendance_rate || 0) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>
        </div>
      </Card>

      {/* Preferred Position Editor */}
      <Card className="p-4 bg-card mb-4 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Preferred Position</h3>
              <p className="text-sm text-muted-foreground">
                Used by Auto-Place to find matches
              </p>
            </div>
          </div>
          {!editingPosition ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPosition(true)}
              className="border-primary text-primary"
            >
              Edit
            </Button>
          ) : null}
        </div>

        {editingPosition && (
          <div className="mt-4 space-y-3">
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="midfielder">Midfielder</SelectItem>
                <SelectItem value="forward">Forward</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={handleSavePosition}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPosition(false);
                  setSelectedPosition(profile?.preferred_position || "midfielder");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Settings Options */}
      <div className="space-y-2">
        {settingsOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.label}
              className="p-4 bg-card cursor-pointer hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Logout Button */}
      <Card
        onClick={handleLogout}
        className="mt-6 p-4 bg-destructive/10 border-destructive cursor-pointer hover:bg-destructive/20 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Log Out</h3>
            <p className="text-sm text-destructive/80">Sign out of your account</p>
          </div>
        </div>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>TeamMind v1.0.0</p>
        <p className="mt-1">© 2025 TeamMind. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Settings;
