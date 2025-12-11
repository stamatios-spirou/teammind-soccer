import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StatusControlPanel } from "./StatusControlPanel";
import { Edit2, User, ChevronDown, ChevronUp, Check, X, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const [expandedPanel, setExpandedPanel] = useState<'profile' | 'status' | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  
  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Player';

  useEffect(() => {
    if (user) {
      loadProfile();
      loadRole();
      loadStatus();
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

  const loadStatus = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('user_availability')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    if (data) {
      setIsLooking(data.status === 'looking');
      setTimeSlot(data.time_slot);
    }
  };

  const handleEditOpen = () => {
    setEditPosition(profile?.preferred_position || '');
    setEditRole(userRole);
    setEditOpen(true);
    setExpandedPanel(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ preferred_position: editPosition as any })
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      if (editRole !== userRole) {
        await supabase.from('user_roles').delete().eq('user_id', user.id);
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

  const getTimeSlotLabel = (slot: string | null) => {
    switch (slot) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'night': return 'Night';
      default: return '';
    }
  };

  const togglePanel = (panel: 'profile' | 'status') => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
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
      <div className="relative z-10 h-full flex flex-col justify-between px-4 py-4">
        {/* Top Row: Compact Buttons */}
        <div className="flex gap-2">
          {/* Profile Button */}
          <motion.button
            onClick={() => togglePanel('profile')}
            className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-3 py-2 border border-border hover:border-primary/50 transition-all"
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{userName}</span>
            <span className="text-xs text-primary font-medium">{getPositionLabel(profile?.preferred_position || null)}</span>
            {expandedPanel === 'profile' ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </motion.button>

          {/* Status Button */}
          <motion.button
            onClick={() => togglePanel('status')}
            className={`flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-3 py-2 border transition-all ${
              isLooking ? 'border-green-500/50' : 'border-border'
            } hover:border-primary/50`}
            whileTap={{ scale: 0.97 }}
          >
            {isLooking ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={`text-sm font-medium ${isLooking ? 'text-green-500' : 'text-muted-foreground'}`}>
              {isLooking ? 'Looking' : 'Not Looking'}
            </span>
            {isLooking && timeSlot && (
              <span className="text-xs text-primary">• {getTimeSlotLabel(timeSlot)}</span>
            )}
            {expandedPanel === 'status' ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </motion.button>
        </div>

        {/* Expanded Panels */}
        <AnimatePresence>
          {expandedPanel === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="absolute top-16 left-4 right-4 z-20"
            >
              <div className="bg-card/95 backdrop-blur-md rounded-xl p-4 border border-border shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Your Profile</h3>
                  <Button size="sm" variant="ghost" onClick={handleEditOpen}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="text-sm font-semibold text-primary">{getPositionLabel(profile?.preferred_position || null)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm font-semibold text-foreground">{getRoleLabel(userRole)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Skill</p>
                    <p className="text-sm font-semibold text-foreground capitalize">{profile?.skill_level || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {expandedPanel === 'status' && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="absolute top-16 left-4 right-4 z-20"
            >
              <div className="bg-card/95 backdrop-blur-md rounded-xl p-4 border border-border shadow-lg">
                <StatusControlPanel 
                  onStatusChange={() => {
                    loadStatus();
                    setExpandedPanel(null);
                  }} 
                  compact={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Click outside to close */}
      {expandedPanel && (
        <div 
          className="absolute inset-0 z-10" 
          onClick={() => setExpandedPanel(null)}
        />
      )}

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