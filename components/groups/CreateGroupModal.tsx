"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
          <Input
            placeholder="Location name (e.g. Berlin City Library)"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} required />
            <Input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} required />
          </div>

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
