"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  const [editOpen, setEditOpen] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); setEditOpen(false); }
    setSaving(false);
  }

  async function togglePin(pinId: string, isActive: boolean) {
    const res = await fetch(`/api/pins/${pinId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    if (res.ok) {
      setMyPins((prev) => prev.map((p) => (p.id === pinId ? { ...p, is_active: !isActive } : p)));
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

  const displayNameOrUsername = profile?.display_name || profile?.username || "?";
  const activePins = myPins.filter((p) => p.is_active);

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 pt-6 pb-12">

      {/* Profile Hero */}
      <section className="mb-10">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-white shadow-lg" style={{ fontFamily: "var(--font-headline)" }}>
              {displayNameOrUsername.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2c3437]" style={{ fontFamily: "var(--font-headline)" }}>
                {displayNameOrUsername}
              </h1>
              <button
                onClick={() => setEditOpen(!editOpen)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#eaeff2] text-sm font-semibold text-[#2c3437] hover:bg-[#dce4e8] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
            </div>
            <p className="text-sm text-[#596064] mb-3">@{profile?.username}</p>
            {profile?.bio && <p className="text-[#2c3437] text-sm leading-relaxed max-w-md">{profile.bio}</p>}
            <div className="flex gap-6 mt-4">
              <div className="flex flex-col">
                <span className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>{activePins.length}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#596064]">Active Pins</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold" style={{ fontFamily: "var(--font-headline)" }}>{myPins.length}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#596064]">Total Pins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        {editOpen && (
          <form onSubmit={saveProfile} className="mt-6 bg-white rounded-2xl p-6 space-y-4 shadow-sm">
            <Input
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border-[#dce4e8] focus:border-indigo-500"
            />
            <Textarea
              placeholder="Short bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="border-[#dce4e8] focus:border-indigo-500"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-6 py-2.5 bg-[#eaeff2] text-[#2c3437] rounded-xl font-bold text-sm hover:bg-[#dce4e8] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* My Active Pins */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#2c3437]" style={{ fontFamily: "var(--font-headline)" }}>My Pins</h2>
            <p className="text-sm text-[#596064]">Manage your shared discoveries</p>
          </div>
        </div>

        {myPins.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <span className="material-symbols-outlined text-4xl">add_location</span>
            <p className="text-sm font-semibold">No pins yet</p>
            <p className="text-xs">Drop one from the map!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPins.map((pin) => (
              <div
                key={pin.id}
                className={`bg-white p-5 rounded-2xl transition-all ${pin.is_active ? "" : "opacity-60"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: pin.categories?.color + "20" }}
                  >
                    {pin.categories?.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${pin.is_active ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                    {pin.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
                <h3 className="font-bold text-[#2c3437] mb-1 truncate" style={{ fontFamily: "var(--font-headline)" }}>{pin.title}</h3>
                {pin.location_name && (
                  <div className="flex items-center gap-1 text-xs text-[#596064] mb-3">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <span className="truncate">{pin.location_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => togglePin(pin.id, pin.is_active)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    title={pin.is_active ? "Hide pin" : "Show pin"}
                  >
                    <span className={`material-symbols-outlined text-base ${pin.is_active ? "text-indigo-500" : "text-slate-400"}`}>
                      {pin.is_active ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                  <button
                    onClick={() => deletePin(pin.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                    title="Delete pin"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
