import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import FieldsMap from '@/components/Fields/FieldsMap';
import FieldDetailPanel from '@/components/Fields/FieldDetailPanel';

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

// Default field data with coordinates
const defaultFields: Field[] = [
  {
    id: '1',
    name: 'Lubetkin Field',
    address: '100 Lock Street, Newark, NJ 07102',
    latitude: 40.74308793894847,
    longitude: -74.17997257559435,
    activePlayers: 0,
    isForming: false,
    upcomingGames: 3,
  },
  {
    id: '2',
    name: 'Frederick Douglass Field',
    address: '42 Warren Street, Newark, NJ 07102',
    latitude: 40.73980320692472,
    longitude: -74.17576597493134,
    activePlayers: 0,
    isForming: false,
    upcomingGames: 2,
  },
];

const Fields = () => {
  const [fields, setFields] = useState<Field[]>(defaultFields);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  useEffect(() => {
    // Fetch real-time availability data
    const fetchAvailability = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: availability } = await supabase
        .from('user_availability')
        .select('*')
        .eq('date', today)
        .eq('status', 'looking');

      // Simulate active players based on availability
      const activeCount = availability?.length || 0;
      
      setFields(prev => prev.map((field, index) => ({
        ...field,
        activePlayers: index === 0 ? Math.floor(activeCount * 0.6) : Math.floor(activeCount * 0.4),
        isForming: activeCount >= 8,
      })));
    };

    fetchAvailability();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_availability',
        },
        () => {
          fetchAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-screen w-full relative pb-20">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background via-background/80 to-transparent px-4 pt-6 pb-12">
        <h1 className="text-2xl font-bold text-foreground">Fields</h1>
        <p className="text-sm text-muted-foreground">Tap a pin to view details</p>
      </div>

      {/* Interactive Map */}
      <FieldsMap 
        fields={fields} 
        onFieldSelect={setSelectedField} 
      />

      {/* Field Detail Panel */}
      <FieldDetailPanel 
        field={selectedField} 
        onClose={() => setSelectedField(null)} 
      />
    </div>
  );
};

export default Fields;
