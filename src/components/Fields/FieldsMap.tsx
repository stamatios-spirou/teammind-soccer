import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

interface FieldsMapProps {
  fields: Field[];
  onFieldSelect: (field: Field) => void;
}

const FieldsMap: React.FC<FieldsMapProps> = ({ fields, onFieldSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1Ijoic3M2OTQiLCJhIjoiY21peGR3cnJ4MDNjNzNjcHl6bWVmdWI0eSJ9.xVh42M-qHlETAv1Cck7-vQ';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.1724, 40.7357], // Newark, NJ center
      zoom: 14,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each field
    fields.forEach(field => {
      const el = document.createElement('div');
      el.className = 'field-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110 ${field.isForming || field.activePlayers > 0 ? 'animate-pulse' : ''}">
            <svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          ${field.isForming ? `
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
          ` : ''}
          ${field.activePlayers > 0 ? `
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
              ${field.activePlayers} active
            </div>
          ` : ''}
        </div>
      `;

      el.addEventListener('click', () => {
        onFieldSelect(field);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([field.longitude, field.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [fields, onFieldSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/20 to-transparent h-20" />
    </div>
  );
};

export default FieldsMap;
