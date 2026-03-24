"use client";

import { useState, useEffect } from "react";
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

export default function DropPinModal({ open, onClose, initialLocation, onPinDropped, userId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [categorySlug, setCategorySlug] = useState("other");
  const [lat, setLat] = useState(initialLocation?.lat?.toFixed(6) ?? "");
  const [lng, setLng] = useState(initialLocation?.lng?.toFixed(6) ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && initialLocation) {
      setLat(initialLocation.lat.toFixed(6));
      setLng(initialLocation.lng.toFixed(6));
    } else if (open && !initialLocation) {
      setLat("");
      setLng("");
    }
  }, [open, initialLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lat || !lng) {
      toast.error("Double-click on the map to set your location.");
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
                <p className="text-xs text-[#596064] mt-1.5">Double-click the map to set location</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-7 pb-6 space-y-6">
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

              {/* Coords */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="bg-[#f0f4f7] rounded-xl px-3 py-2.5 text-sm text-[#2c3437] placeholder:text-[#acb3b7] border-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
                <input
                  className="bg-[#f0f4f7] rounded-xl px-3 py-2.5 text-sm text-[#2c3437] placeholder:text-[#acb3b7] border-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 pb-7 pt-2">
              <button
                type="submit"
                disabled={loading}
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
