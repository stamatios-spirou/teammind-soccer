import { useState, useEffect } from "react";
import { Clock, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DailyAvailabilityPopup } from "./DailyAvailabilityPopup";

interface StatusControlPanelProps {
  onStatusChange?: () => void;
}

export const StatusControlPanel = ({ onStatusChange }: StatusControlPanelProps) => {
  const { user } = useAuth();
  const [isLooking, setIsLooking] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (user) {
      loadCurrentStatus();
    }
  }, [user]);

  const loadCurrentStatus = async () => {
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
    } else {
      setIsLooking(false);
      setTimeSlot(null);
    }
  };

  const handleAvailabilitySet = (slot: string) => {
    setIsLooking(true);
    setTimeSlot(slot);
    setShowPopup(false);
    onStatusChange?.();
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const getTimeSlotLabel = (slot: string | null) => {
    switch (slot) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'night': return 'Night';
      default: return '';
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-border hover:border-primary/50 transition-colors text-left w-full"
      >
        <div className="flex items-center gap-2 mb-1">
          {isLooking ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <X className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs font-medium text-muted-foreground">Today's Status</span>
        </div>
        <p className={`text-sm font-semibold ${isLooking ? 'text-green-500' : 'text-muted-foreground'}`}>
          {isLooking ? 'Looking for a Game' : 'Not Looking Today'}
        </p>
        {isLooking && timeSlot && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">{getTimeSlotLabel(timeSlot)}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">Tap to change</p>
      </button>

      {showPopup && (
        <DailyAvailabilityPopup
          onClose={handleClose}
          onAvailabilitySet={handleAvailabilitySet}
        />
      )}
    </>
  );
};