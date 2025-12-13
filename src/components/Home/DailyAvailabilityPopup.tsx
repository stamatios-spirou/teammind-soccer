import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Sunset, Moon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DailyAvailabilityPopupProps {
  onClose: () => void;
  onAvailabilitySet: (timeSlot: string) => void;
}

export const DailyAvailabilityPopup = ({ onClose, onAvailabilitySet }: DailyAvailabilityPopupProps) => {
  const [step, setStep] = useState<"question" | "time">("question");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const timeSlots = [
    { id: "morning", label: "Morning", icon: Sun, description: "6am - 12pm" },
    { id: "afternoon", label: "Afternoon", icon: Sunset, description: "12pm - 6pm" },
    { id: "night", label: "Night", icon: Moon, description: "6pm - 12am" },
  ];

  const handleYes = () => {
    setStep("time");
  };

  const handleTimeSelect = async (timeSlot: string) => {
    if (!user) return;
    
    setSelectedTime(timeSlot);
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert availability for today
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

      toast({
        title: "You're in the pool!",
        description: `Looking for ${timeSlot} games. We'll notify you when a match forms.`,
      });

      onAvailabilitySet(timeSlot);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error setting availability",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center pb-[calc(80px+env(safe-area-inset-bottom))]"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-6 pb-8 shadow-2xl border border-border mb-4 sm:mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <AnimatePresence mode="wait">
            {step === "question" ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <span className="text-3xl">⚽</span>
                </div>

                {/* Question */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Are you trying to play today?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Let us know and we'll match you with the perfect game
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleYes}
                    className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
                  >
                    Yes — Find Me a Game
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full h-14 text-lg font-medium border-border"
                  >
                    No — Just Browsing
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    What time works best?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Select your preferred time window
                  </p>
                </div>

                {/* Time Slots */}
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map(({ id, label, icon: Icon, description }) => (
                    <button
                      key={id}
                      onClick={() => handleTimeSelect(id)}
                      disabled={isSubmitting}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                        ${selectedTime === id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50 hover:bg-muted"
                        }
                        ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {isSubmitting && selectedTime === id ? (
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      ) : (
                        <Icon className={`w-8 h-8 mb-2 ${selectedTime === id ? "text-primary" : "text-muted-foreground"}`} />
                      )}
                      <span className={`font-semibold text-sm ${selectedTime === id ? "text-primary" : "text-foreground"}`}>
                        {label}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">{description}</span>
                    </button>
                  ))}
                </div>

                {/* Back button */}
                <button
                  onClick={() => setStep("question")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  ← Go back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
