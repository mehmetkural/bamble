"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface GeoSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateGroupModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [categorySlug, setCategorySlug] = useState("other");
  const [loading, setLoading] = useState(false);

  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return; }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&proximity=10.9028,49.8988&bbox=10.50,49.60,11.30,50.20&language=de,en&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    setSuggestions(data.features?.map((f: any) => ({ id: f.id, place_name: f.place_name, center: f.center })) ?? []);
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
      toast.error("Location is required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        location_name: locationName,
        category_slug: categorySlug,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        is_public: true,
      }),
    });
    if (res.ok) {
      toast.success("Group created!");
      onCreated();
      setName("");
      setDescription("");
      setLocationName("");
      setAddressQuery("");
      setLat("");
      setLng("");
      setCategorySlug("other");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create group");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
          <p className="text-sm text-gray-500">Visible on the map for others to discover and join</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategorySlug(cat.slug)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors",
                    categorySlug === cat.slug ? "border-2" : "border-gray-200 hover:bg-gray-50"
                  )}
                  style={categorySlug === cat.slug ? { borderColor: cat.color, backgroundColor: cat.color + "15" } : {}}
                  title={cat.label}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="truncate w-full text-center text-gray-600">{cat.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          {/* Address search */}
          <div className="relative">
            <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg shrink-0">search</span>
              <input
                className="flex-1 bg-transparent text-sm text-[#2c3437] placeholder:text-muted-foreground outline-none border-none"
                placeholder="Adres ara (örn. Maxplatz, Bamberg)"
                value={addressQuery}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              {addressQuery && (
                <button type="button" onClick={() => { setAddressQuery(""); setSuggestions([]); setLat(""); setLng(""); }}>
                  <span className="material-symbols-outlined text-sm text-muted-foreground">close</span>
                </button>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                {suggestions.map((s) => (
                  <button key={s.id} type="button" onClick={() => selectSuggestion(s)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0">
                    <span className="material-symbols-outlined text-indigo-400 text-base mt-0.5 shrink-0">location_on</span>
                    <span className="text-sm text-[#2c3437] leading-snug">{s.place_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            placeholder="Location name (e.g. Bamberg City Library)"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
          {lat && lng && (
            <p className="text-xs text-indigo-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
