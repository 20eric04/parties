"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface Venue {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
}

interface Props {
  venues: Venue[];
  selectedId?: number;
  onSelect?: (id: number) => void;
  className?: string;
}

export default function VenueMap({ venues, selectedId, onSelect, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
      document.head.appendChild(link);

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl || !containerRef.current) return;
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-80.1918, 25.7617],
        zoom: 11,
      });

      mapRef.current = map;
      setMapLoaded(true);

      venues.forEach((v) => {
        if (!v.lat || !v.lng) return;
        const el = document.createElement("div");
        el.className = "w-3 h-3 rounded-full bg-parties-accent border-2 border-white cursor-pointer";
        el.style.cssText = "width:12px;height:12px;border-radius:50%;background:#E54D2E;border:2px solid white;cursor:pointer;";
        el.onclick = () => onSelect?.(v.id);
        new mapboxgl.Marker(el).setLngLat([v.lng, v.lat]).addTo(map);
      });
    };
    script.onerror = () => setMapLoaded(false);
    document.head.appendChild(script);

    return () => { mapRef.current?.remove(); };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const v = venues.find((v) => v.id === selectedId);
    if (v?.lat && v?.lng) {
      mapRef.current.flyTo({ center: [v.lng, v.lat], zoom: 14, duration: 1000 });
    }
  }, [selectedId, venues]);

  // Fallback SVG map
  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className={`bg-parties-surface rounded-2xl p-6 flex flex-col items-center justify-center ${className}`}>
        <div className="relative w-full h-full min-h-[200px]">
          <svg viewBox="0 0 400 200" className="w-full h-full opacity-20">
            <rect width="400" height="200" fill="none" />
            <path d="M0 100 Q100 50 200 100 Q300 150 400 100" stroke="currentColor" strokeWidth="1" fill="none" className="text-parties-muted" />
            <path d="M0 120 Q100 70 200 120 Q300 170 400 120" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-parties-muted" />
          </svg>
          {venues.slice(0, 8).map((v, i) => (
            <button key={v.id} onClick={() => onSelect?.(v.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${selectedId === v.id ? "scale-125" : ""}`}
              style={{ left: `${15 + (i * 10) % 70}%`, top: `${25 + (i * 17) % 50}%` }}>
              <MapPin size={16} className={selectedId === v.id ? "text-parties-accent fill-parties-accent" : "text-parties-muted"} />
            </button>
          ))}
        </div>
        <p className="text-xs text-parties-muted mt-2">{venues.length} venues</p>
      </div>
    );
  }

  return <div ref={containerRef} className={`rounded-2xl overflow-hidden ${className}`} style={{ minHeight: 200 }} />;
}
