import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Field {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  activePlayers: number;
  isForming: boolean;
  upcomingGames: number;
}

interface FieldDetailPanelProps {
  field: Field | null;
  onClose: () => void;
}

const FieldDetailPanel: React.FC<FieldDetailPanelProps> = ({ field, onClose }) => {
  return (
    <AnimatePresence>
      {field && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-10"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-20 bg-card rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="px-6 pb-8 space-y-5">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{field.name}</h2>
                  {field.isForming && (
                    <Badge className="bg-green-500 text-white animate-pulse">
                      Game Forming
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{field.address}</span>
                </div>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{field.activePlayers}</p>
                  <p className="text-xs text-muted-foreground">Active Now</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{field.upcomingGames}</p>
                  <p className="text-xs text-muted-foreground">Games Today</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">22</p>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                </div>
              </div>

              {/* Forming Game Alert */}
              {field.isForming && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-500">8/10 Players — Forming Now</p>
                      <p className="text-sm text-muted-foreground">Afternoon match • 7v7</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              )}

              {/* Upcoming Games */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Upcoming Games</h3>
                <div className="space-y-2">
                  {[1, 2].slice(0, field.upcomingGames || 1).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">
                          {i === 0 ? 'Today, 4:00 PM' : 'Tomorrow, 6:00 PM'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {i === 0 ? '7v7 Casual • 12/14 players' : '9v9 Competitive • 8/18 players'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {field.isForming ? (
                  <Button className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600">
                    Join Forming Game
                  </Button>
                ) : (
                  <Button className="w-full h-12 text-base font-semibold">
                    View All Games
                  </Button>
                )}
                <Button variant="outline" className="w-full h-12 text-base">
                  Get Directions
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FieldDetailPanel;
