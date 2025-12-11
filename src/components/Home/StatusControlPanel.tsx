import { useState, useEffect } from "react";
import { Sun, Sunset, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface StatusControlPanelProps {
  onStatusChange?: () => void;
  compact?: boolean;
}

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', icon: Sun, description: '6am - 12pm' },
  { id: 'afternoon', label: 'Afternoon', icon: Sunset, description: '12pm - 6pm' },
  { id: 'night', label: 'Night', icon: Moon, description: '6pm - 12am' },
];

export const StatusControlPanel = ({ onStatusChange, compact = true }: StatusControlPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLooking, setIsLooking] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSetAvailability = async (slot: string) => {
    if (!user) return;
    setSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('user_availability')
        .upsert({
          user_id: user.id,
          date: today,
          time_slot: slot,
          status: 'looking',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      setIsLooking(true);
      setTimeSlot(slot);
      toast({ title: "You're looking for a game!", description: `Time: ${TIME_SLOTS.find(t => t.id === slot)?.label}` });
      onStatusChange?.();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotLooking = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('user_availability')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today);

      setIsLooking(false);
      setTimeSlot(null);
      toast({ title: "Status updated", description: "You're not looking for a game today" });
      onStatusChange?.();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground text-sm">Today's Status</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {TIME_SLOTS.map((slot) => {
          const Icon = slot.icon;
          const isSelected = isLooking && timeSlot === slot.id;
          return (
            <button
              key={slot.id}
              onClick={() => handleSetAvailability(slot.id)}
              disabled={submitting}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-primary/20 border-primary'
                  : 'bg-muted/50 border-border hover:border-primary/50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {slot.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{slot.description}</span>
            </button>
          );
        })}
      </div>

      {isLooking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNotLooking}
          disabled={submitting}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Not looking today
        </Button>
      )}
    </div>
  );
};