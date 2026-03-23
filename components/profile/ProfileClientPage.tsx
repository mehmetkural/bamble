"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface Pin {
  id: string;
  title: string;
  description: string | null;
  location_name: string | null;
  is_active: boolean;
  created_at: string;
  categories: { slug: string; label: string; icon: string; color: string };
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export default function ProfileClientPage({
  profile,
  pins,
  userId,
}: {
  profile: Profile | null;
  pins: Pin[];
  userId: string;
}) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [myPins, setMyPins] = useState(pins);
  const [saving, setSaving] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
    setSaving(false);
  }

  async function togglePin(pinId: string, isActive: boolean) {
    const res = await fetch(`/api/pins/${pinId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    if (res.ok) {
      setMyPins((prev) =>
        prev.map((p) => (p.id === pinId ? { ...p, is_active: !isActive } : p))
      );
      toast.success(isActive ? "Pin hidden" : "Pin visible again");
    }
  }

  async function deletePin(pinId: string) {
    const res = await fetch(`/api/pins/${pinId}`, { method: "DELETE" });
    if (res.ok) {
      setMyPins((prev) => prev.filter((p) => p.id !== pinId));
      toast.success("Pin deleted");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* Profile card */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 mb-4">
          {(profile?.display_name || profile?.username || "?").charAt(0).toUpperCase()}
        </div>
        <p className="text-sm text-gray-500 mb-4">@{profile?.username}</p>

        <form onSubmit={saveProfile} className="space-y-3">
          <Input
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Textarea
            placeholder="Short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>

      {/* My pins */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Pins</h2>
        {myPins.length === 0 ? (
          <p className="text-sm text-gray-400">No pins yet. Drop one from the map!</p>
        ) : (
          <div className="space-y-3">
            {myPins.map((pin) => (
              <div
                key={pin.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  pin.is_active ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: pin.categories?.color + "20" }}
                >
                  {pin.categories?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{pin.title}</p>
                  {pin.location_name && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {pin.location_name}
                    </div>
                  )}
                  <Badge
                    variant="secondary"
                    className="mt-1 text-xs"
                    style={{ backgroundColor: pin.categories?.color + "15", color: pin.categories?.color }}
                  >
                    {pin.categories?.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePin(pin.id, pin.is_active)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    title={pin.is_active ? "Hide pin" : "Show pin"}
                  >
                    {pin.is_active
                      ? <ToggleRight className="w-5 h-5 text-indigo-500" />
                      : <ToggleLeft className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={() => deletePin(pin.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                    title="Delete pin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
