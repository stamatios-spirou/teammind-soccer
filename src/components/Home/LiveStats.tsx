import { useState, useEffect } from "react";
import { Users, Trophy, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

export const LiveStats = () => {
  const [playersOnline, setPlayersOnline] = useState(0);
  const [gamesToday, setGamesToday] = useState(0);
  const [fieldsAvailable, setFieldsAvailable] = useState(0);

  useEffect(() => {
    fetchStats();
    
    // Set up realtime subscription for profiles (players online)
    const profilesChannel = supabase
      .channel('profiles-online')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchPlayersOnline()
      )
      .subscribe();

    // Set up realtime subscription for matches
    const matchesChannel = supabase
      .channel('matches-today')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => fetchGamesToday()
      )
      .subscribe();

    // Set up realtime subscription for fields
    const fieldsChannel = supabase
      .channel('fields-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fields' },
        () => fetchFieldsAvailable()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(fieldsChannel);
    };
  }, []);

  const fetchStats = async () => {
    await Promise.all([
      fetchPlayersOnline(),
      fetchGamesToday(),
      fetchFieldsAvailable()
    ]);
  };

  const fetchPlayersOnline = async () => {
    // Count profiles with recent updated_at (within last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", fifteenMinutesAgo);
    
    setPlayersOnline(count || 0);
  };

  const fetchGamesToday = async () => {
    const today = new Date();
    const todayStart = startOfDay(today).toISOString();
    const todayEnd = endOfDay(today).toISOString();

    const { count } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .gte("scheduled_at", todayStart)
      .lte("scheduled_at", todayEnd);
    
    setGamesToday(count || 0);
  };

  const fetchFieldsAvailable = async () => {
    const { count } = await supabase
      .from("fields")
      .select("*", { count: "exact", head: true })
      .eq("status", "available");
    
    setFieldsAvailable(count || 0);
  };

  return (
    <div className="grid grid-cols-3 gap-3 px-4 -mt-6 relative z-20">
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{playersOnline}</span>
        </div>
        <p className="text-xs text-muted-foreground">Online Now</p>
      </div>
      
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{gamesToday}</span>
        </div>
        <p className="text-xs text-muted-foreground">Games Today</p>
      </div>
      
      <div className="bg-card rounded-xl p-3 text-center border border-border shadow-md">
        <div className="flex items-center justify-center gap-1 mb-1">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-xl font-bold text-foreground">{fieldsAvailable}</span>
        </div>
        <p className="text-xs text-muted-foreground">Fields Open</p>
      </div>
    </div>
  );
};
