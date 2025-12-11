import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StatusControlPanel } from "./StatusControlPanel";
import { Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  full_name: string | null;
  preferred_position: string | null;
  skill_level: string | null;
}

export const HeroSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>('player');
  const [editOpen, setEditOpen] = useState(false);
  const [editPosition, setEditPosition] = useState('');
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);
  
  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Player';

  useEffect(() => {
    if (user) {
      loadProfile();
      loadRole();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, preferred_position, skill_level')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const loadRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setUserRole(data.role);
  };

  const handleEditOpen = () => {
    setEditPosition(profile?.preferred_position || '');
    setEditRole(userRole);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update position
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ preferred_position: editPosition as any })
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      // Update role if changed
      if (editRole !== userRole) {
        // Delete existing role
        await supabase.from('user_roles').delete().eq('user_id', user.id);
        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: editRole as any });
        if (roleError) throw roleError;
        setUserRole(editRole);
      }

      setProfile(prev => prev ? { ...prev, preferred_position: editPosition } : null);
      setEditOpen(false);
      toast({ title: "Profile updated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getPositionLabel = (pos: string | null) => {
    switch (pos) {
      case 'goalkeeper': return 'GK';
      case 'defender': return 'DEF';
      case 'midfielder': return 'MID';
      case 'forward': return 'FWD';
      default: return 'N/A';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'captain': return 'Captain';
      case 'staff': return 'Staff';
      default: return 'Player';
    }
  };
  
  return (
    <div className="relative h-72 overflow-hidden">
      {/* Stadium Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80')`
        }} 
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      
      {/* Orange Accent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between px-4 py-6">
        {/* Top Row: User Info + Status Panel */}
        <div className="flex justify-between items-start gap-4">
          {/* User Info - Left Side */}
          <button
            onClick={handleEditOpen}
            className="bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-border hover:border-primary/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{userName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-medium">{getPositionLabel(profile?.preferred_position || null)}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</span>
                </div>
              </div>
              <Edit2 className="w-3 h-3 text-muted-foreground ml-1" />
            </div>
          </button>

          {/* Status Control Panel - Right Side */}
          <div className="w-40">
            <StatusControlPanel />
          </div>
        </div>

        {/* Bottom: Welcome Text */}
        <div>
          <h1 className="font-black text-foreground leading-tight text-xl sm:text-2xl max-w-[280px]">
            <span className="text-primary">{userName}</span>, pickup soccer is happening near you today.
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            Join a game at NJIT & Rutgers in seconds.
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Preferred Position</Label>
              <Select value={editPosition} onValueChange={setEditPosition}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                  <SelectItem value="defender">Defender</SelectItem>
                  <SelectItem value="midfielder">Midfielder</SelectItem>
                  <SelectItem value="forward">Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="captain">Captain</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};