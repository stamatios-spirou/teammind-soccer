import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityStats {
  playersLooking: number;
  communityMembers: number;
  gamesToday: number;
}

export const useAvailabilityStats = () => {
  const [stats, setStats] = useState<AvailabilityStats>({
    playersLooking: 0,
    communityMembers: 0,
    gamesToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get players looking today
      const { count: lookingCount } = await supabase
        .from("user_availability")
        .select("*", { count: "exact", head: true })
        .eq("date", today)
        .eq("status", "looking");

      // Get total community members
      const { count: memberCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get games scheduled today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { count: gamesCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_at", startOfDay.toISOString())
        .lte("scheduled_at", endOfDay.toISOString());

      setStats({
        playersLooking: lookingCount || 0,
        communityMembers: memberCount || 0,
        gamesToday: gamesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime updates for availability
    const channel = supabase
      .channel("availability-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_availability",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, refetch: fetchStats };
};
