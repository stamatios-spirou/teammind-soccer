import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Sun, Sunset, Moon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const settingsOptions = [
  {
    icon: User,
    label: "Profile",
    description: "Update your information",
    route: "/onboarding",
  },
  {
    icon: Bell,
    label: "Notifications",
    description: "Manage your alerts",
    route: null,
  },
  {
    icon: Shield,
    label: "Privacy & Security",
    description: "Control your data",
    route: null,
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    description: "Get assistance",
    route: null,
  },
];

const timeSlots = [
  { id: "morning", label: "Morning", icon: Sun, description: "6am - 12pm" },
  { id: "afternoon", label: "Afternoon", icon: Sunset, description: "12pm - 6pm" },
  { id: "night", label: "Night", icon: Moon, description: "6pm - 12am" },
];

interface UserProfile {
  full_name: string | null;
  email: string;
  preferred_position: string | null;
  skill_level: string | null;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadCurrentAvailability();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, preferred_position, skill_level")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const loadCurrentAvailability = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("user_availability")
      .select("time_slot, status")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();
    
    if (data) {
      setCurrentStatus(data.status);
      setSelectedTimeSlot(data.time_slot);
    }
  };

  const handleTimeSlotSelect = async (timeSlot: string) => {
    if (!user) return;
    
    setIsUpdatingStatus(true);
    setSelectedTimeSlot(timeSlot);

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("user_availability")
        .upsert({
          user_id: user.id,
          date: today,
          time_slot: timeSlot,
          status: "looking"
        }, {
          onConflict: "user_id,date"
        });

      if (error) throw error;

      setCurrentStatus("looking");
      toast({
        title: "Status updated!",
        description: `You're now looking for ${timeSlot} games.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleClearStatus = async () => {
    if (!user) return;
    
    setIsUpdatingStatus(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("user_availability")
        .delete()
        .eq("user_id", user.id)
        .eq("date", today);

      if (error) throw error;

      setCurrentStatus(null);
      setSelectedTimeSlot(null);
      toast({
        title: "Status cleared",
        description: "You're no longer looking for games today.",
      });
    } catch (error: any) {
      toast({
        title: "Error clearing status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
      setIsLoggingOut(false);
    }
  };

  const handleSettingClick = (route: string | null, label: string) => {
    if (route) {
      navigate(route);
    } else {
      toast({
        title: "Coming soon",
        description: `${label} settings will be available soon.`,
      });
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatPosition = (position: string | null) => {
    if (!position) return null;
    return position.charAt(0).toUpperCase() + position.slice(1);
  };

  const formatSkillLevel = (level: string | null) => {
    if (!level) return null;
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="min-h-screen pt-6 px-4 pb-8">
      {/* Profile Header */}
      <Card className="p-6 bg-card mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {profile ? getInitials(profile.full_name, profile.email) : "..."}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {profile?.full_name || "Loading..."}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {profile?.email || user?.email || ""}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {profile?.preferred_position && (
                <Badge variant="outline" className="badge-skill">
                  {formatPosition(profile.preferred_position)}
                </Badge>
              )}
              {profile?.skill_level && (
                <Badge variant="outline" className="badge-skill border-primary text-primary">
                  {formatSkillLevel(profile.skill_level)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Change Status for Today */}
      <Card className="p-4 bg-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Change Status for Today</h3>
            <p className="text-sm text-muted-foreground">
              {currentStatus === "looking" && selectedTimeSlot
                ? `Currently looking for ${selectedTimeSlot} games`
                : "Set when you're available to play"}
            </p>
          </div>
          {currentStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearStatus}
              disabled={isUpdatingStatus}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {timeSlots.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => handleTimeSlotSelect(id)}
              disabled={isUpdatingStatus}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                ${selectedTimeSlot === id 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50 hover:bg-muted"
                }
                ${isUpdatingStatus ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {isUpdatingStatus && selectedTimeSlot === id ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <Icon className={`w-6 h-6 mb-1 ${selectedTimeSlot === id ? "text-primary" : "text-muted-foreground"}`} />
              )}
              <span className={`font-semibold text-sm ${selectedTimeSlot === id ? "text-primary" : "text-foreground"}`}>
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Settings Options */}
      <div className="space-y-2">
        {settingsOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.label}
              onClick={() => handleSettingClick(option.route, option.label)}
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
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 text-destructive animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </h3>
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
