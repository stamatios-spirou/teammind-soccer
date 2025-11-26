import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Calendar, MapPin, Shield } from 'lucide-react';

const AutoPlacementConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result || {
    teamName: 'Blue Thunder',
    position: 'Midfielder',
    matchTime: 'Today at 7:00 PM',
    field: 'South Field',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-dark to-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-electric/20 mb-2">
            <Check className="w-8 h-8 text-green-electric" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Confirmed!</h1>
          <p className="text-xl text-foreground">You're on the Team</p>
        </div>

        {/* Team Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-rich/20 to-primary/10 border-2 border-primary/50">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {result.teamName}
              </h2>
              <p className="text-muted-foreground">
                Position: {result.position} – Mixed Playstyle
              </p>
            </div>
          </div>
        </Card>

        {/* Match Details Card */}
        <Card className="p-6 bg-card space-y-4">
          <h3 className="font-bold text-foreground text-lg">Your Next Match</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Scheduled</div>
                <div className="font-semibold text-foreground">{result.matchTime}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-semibold text-foreground">{result.field}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/chat')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg rounded-xl"
          >
            Go to Team Chat
          </Button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full text-primary text-center py-3"
          >
            Add to Calendar
          </button>
        </div>

        {/* App Branding */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">TeamMind</p>
        </div>
      </div>
    </div>
  );
};

export default AutoPlacementConfirmation;
