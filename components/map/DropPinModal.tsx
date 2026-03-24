"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  initialLocation: { lng: number; lat: number } | null;
  onPinDropped: () => void;
  userId: string;
}

interface GeoSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function DropPinModal({ open, onClose, initialLocation, onPinDropped, userId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [categorySlug, setCategorySlug] = useState("other");
  const [lat, setLat] = useState(initialLocation?.lat?.toFixed(6) ?? "");
  const [lng, setLng] = useState(initialLocation?.lng?.toFixed(6) ?? "");
  const [loading, setLoading] = useState(false);

  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open && initialLocation) {
      setLat(initialLocation.lat.toFixed(6));
      setLng(initialLocation.lng.toFixed(6));
    } else if (open && !initialLocation) {
      setLat("");
      setLng("");
    }
  }, [open, initialLocation]);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return; }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&proximity=10.9028,49.8988&bbox=10.50,49.60,11.30,50.20&language=de,en&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    setSuggestions(data.features?.map((f: any) => ({
      id: f.id,
      place_name: f.place_name,
      center: f.center,
    })) ?? []);
    setShowSuggestions(true);
  }, []);

  function handleAddressChange(value: string) {
    setAddressQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(value), 300);
  }

  function selectSuggestion(s: GeoSuggestion) {
    setLng(s.center[0].toFixed(6));
    setLat(s.center[1].toFixed(6));
    setAddressQuery(s.place_name);
    if (!locationName) setLocationName(s.place_name.split(",")[0]);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lat || !lng) {
      toast.error("Harita üzerinde çift tıklayın veya adres arayın.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        location_name: locationName,
        category_slug: categorySlug,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      }),
    });
    if (res.ok) {
      onPinDropped();
      onClose();
      setTitle("");
      setDescription("");
      setLocationName("");
      setAddressQuery("");
      setCategorySlug("other");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to drop pin");
    }
    setLoading(false);
  }

  const selectedCat = CATEGORIES.find((c) => c.slug === categorySlug);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-white/90 backdrop-blur-2xl">
          {/* Header */}
          <div className="px-7 pt-7 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#2c3437]" style={{ fontFamily: "var(--font-headline)" }}>
                Drop a Pin
              </h2>
              {lat && lng ? (
                <div className="flex items-center gap-1.5 mt-1.5 py-1 px-2.5 bg-[#f0f4f7] rounded-full w-fit">
                  <span className="material-symbols-outlined text-sm text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  <span className="text-xs font-semibold text-[#596064] uppercase tracking-wide">
                    {parseFloat(lat).toFixed(3)}, {parseFloat(lng).toFixed(3)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#596064] mt-1.5">Adres girin veya haritada çift tıklayın</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-7 pb-6 space-y-5">
              {/* Address search */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-[#f0f4f7] rounded-xl px-3 py-2.5">
                  <span className="material-symbols-outlined text-indigo-400 text-lg shrink-0">search</span>
                  <input
                    className="flex-1 bg-transparent text-sm text-[#2c3437] placeholder:text-[#acb3b7] outline-none border-none"
                    placeholder="Adres ara (örn. Maxplatz, Bamberg)"
                    value={addressQuery}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    autoComplete="off"
                  />
                  {addressQuery && (
                    <button type="button" onClick={() => { setAddressQuery(""); setSuggestions([]); }}
                      className="text-[#acb3b7] hover:text-[#596064]">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0"
                      >
                        <span className="material-symbols-outlined text-indigo-400 text-base mt-0.5 shrink-0">location_on</span>
                        <span className="text-sm text-[#2c3437] leading-snug">{s.place_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category picker */}
              <div>
                <p className="text-xs font-bold text-[#596064] mb-3 uppercase tracking-widest">Choose Your Vibe</p>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setCategorySlug(cat.slug)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center gap-0.5 rounded-xl text-xs transition-all hover:scale-105 active:scale-95",
                        categorySlug === cat.slug
                          ? "ring-2 scale-105"
                          : "bg-[#eaeff2] hover:bg-[#e3e9ed]"
                      )}
                      style={categorySlug === cat.slug ? {
                        backgroundColor: cat.color + "20",
                        border: `2px solid ${cat.color}`,
                      } : {}}
                      title={cat.label}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[9px] font-semibold text-[#596064] truncate w-full text-center px-0.5">
                        {cat.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="relative group">
                <input
                  className="w-full bg-transparent border-none border-b-2 border-[#dce4e8] focus:border-indigo-500 focus:ring-0 pb-2 text-lg font-bold text-[#2c3437] placeholder:text-[#acb3b7] outline-none transition-colors"
                  style={{ fontFamily: "var(--font-headline)" }}
                  placeholder="What are you up to?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={80}
                />
              </div>

              {/* Description */}
              <div className="relative">
                <input
                  className="w-full bg-transparent border-none border-b border-[#dce4e8]/50 focus:border-indigo-400 focus:ring-0 pb-2 text-sm text-[#596064] placeholder:text-[#acb3b7] outline-none transition-colors"
                  placeholder="Add a quick note (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                />
              </div>

              {/* Location name */}
              <div className="relative">
                <input
                  className="w-full bg-transparent border-none border-b border-[#dce4e8]/50 focus:border-indigo-400 focus:ring-0 pb-2 text-sm text-[#596064] placeholder:text-[#acb3b7] outline-none transition-colors"
                  placeholder="Location name (e.g. Central Library)"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 pb-7 pt-2">
              <button
                type="submit"
                disabled={loading || !lat || !lng}
                className="w-full py-4 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {loading ? "Dropping..." : "Post Anonymously"}
              </button>
              <p className="text-center mt-3 text-[10px] text-[#747c80] font-bold uppercase tracking-widest">
                Visible to everyone nearby
              </p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
