"use client";
import { useState } from "react";
import { Search, Check, X } from "lucide-react";

const REGIONS: { name: string; cities: string[] }[] = [
  { name: "Americas", cities: ["Miami", "NYC", "Las Vegas", "Scottsdale", "Tulum", "Cabo", "St. Barths", "St. Martin"] },
  { name: "Europe", cities: ["London", "Paris", "Ibiza", "Mykonos", "Amsterdam", "Barcelona", "Milan"] },
  { name: "Côte d'Azur", cities: ["St. Tropez", "Monaco", "Cannes"] },
  { name: "Middle East", cities: ["Dubai"] },
];

interface Props {
  open: boolean;
  onClose: () => void;
  activeCity: string;
  onSelect: (city: string) => void;
}

export default function CitySwitcher({ open, onClose, activeCity, onSelect }: Props) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const filtered = REGIONS.map((r) => ({
    ...r,
    cities: r.cities.filter((c) => c.toLowerCase().includes(search.toLowerCase())),
  })).filter((r) => r.cities.length > 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-parties-text">Select City</h3>
          <button onClick={onClose} className="p-1 text-parties-muted"><X size={20} /></button>
        </div>
        <div className="px-5 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-parties-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cities..." className="w-full bg-parties-soft rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <button onClick={() => { onSelect("All"); onClose(); }} className="w-full flex items-center justify-between py-3 border-b border-black/5">
            <span className="text-sm font-medium text-parties-text">All Cities</span>
            {activeCity === "All" && <Check size={18} className="text-parties-accent" />}
          </button>
          {filtered.map((region) => (
            <div key={region.name} className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-parties-muted mb-2">{region.name}</p>
              {region.cities.map((city) => (
                <button key={city} onClick={() => { onSelect(city); onClose(); }} className="w-full flex items-center justify-between py-3 border-b border-black/5">
                  <span className="text-sm font-medium text-parties-text">{city}</span>
                  {activeCity === city && <Check size={18} className="text-parties-accent" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
