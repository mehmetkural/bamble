"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  // Sync location when modal opens with new location
  useState(() => {
    if (initialLocation) {
      setLat(initialLocation.lat.toFixed(6));
      setLng(initialLocation.lng.toFixed(6));
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lat || !lng) {
      toast.error("Location is required. Double-click on the map to set it.");
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Drop a Pin</DialogTitle>
          <p className="text-sm text-gray-500">Let others nearby know what you're up to</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category picker */}
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
                    categorySlug === cat.slug
                      ? "border-2 bg-opacity-10"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                  style={categorySlug === cat.slug ? {
                    borderColor: cat.color,
                    backgroundColor: cat.color + "15",
                  } : {}}
                  title={cat.label}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="truncate w-full text-center text-gray-600">{cat.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              placeholder="What are you doing? e.g. Studying IELTS"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={80}
            />
          </div>

          <Textarea
            placeholder="More details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={300}
          />

          <Input
            placeholder="Location name (e.g. Central Library, Berlin)"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
            <Input
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
          </div>

          <p className="text-xs text-gray-400">
            Tip: Double-click on the map to auto-fill your location coordinates.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Dropping..." : "Drop Pin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
