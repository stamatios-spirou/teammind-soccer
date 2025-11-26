import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Search } from 'lucide-react';

interface SearchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: any) => void;
  selectedTime: string;
}

export const SearchingModal = ({ isOpen, onClose, onComplete, selectedTime }: SearchingModalProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Checking team rosters…',
    'Matching preferences: position, skill, time…',
    'Found 3 potential spots',
    'Optimizing for best fit',
    'Finalizing placement…',
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Simulate finding a match
          setTimeout(() => {
            onComplete({
              teamName: 'Blue Thunder',
              position: 'Midfielder',
              matchTime: 'Today at 7:00 PM',
              field: 'South Field',
            });
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * steps.length);
    setCurrentStep(Math.min(stepIndex, steps.length - 1));
  }, [progress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Finding Your Team…</h2>
            <p className="text-xl text-primary font-semibold">Searching for a Match!</p>
          </div>

          {/* Progress Circle */}
          <div className="flex justify-center my-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0EEA4A" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="space-y-2 bg-card/50 rounded-xl p-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 transition-opacity ${
                  index <= currentStep ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5 text-green-electric shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
                )}
                <span className="text-sm text-foreground text-left">{step}</span>
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-1">
            <div className="text-sm text-muted-foreground">For: User</div>
            <div className="text-sm text-muted-foreground">
              Preferred Time: {selectedTime || 'Any time'}
            </div>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full rounded-xl h-12"
          >
            Cancel Placement
          </Button>
        </div>
      </div>
    </div>
  );
};
