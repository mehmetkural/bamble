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

  const displayNameOrUsername = profile?.display_name || profile?.username || "Explorer";
  const activePins = myPins.filter((p) => p.is_active);
  const initials = displayNameOrUsername.slice(0, 2).toUpperCase();

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafb]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-10">

        {/* ── Header ── */}
        <header className="mb-14 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="relative">
              <div className="absolute -top-10 -left-4 w-28 h-28 bg-cyan-100/40 rounded-full blur-3xl -z-10" />
              <p className="text-[#4c56af] font-semibold tracking-widest uppercase text-xs mb-2">Navigator Profile</p>
              <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-[#191c1d]">
                {displayNameOrUsername}
              </h2>
              <p className="mt-3 text-[#3f4949] max-w-md leading-relaxed text-sm">
                {profile?.bio || "No bio yet — click Edit to add one."}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-[#006069] flex items-center justify-center text-2xl font-bold text-white font-headline shadow-lg">
                {initials}
              </div>
              <button
                onClick={() => setEditOpen(!editOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#bec8c9] text-sm font-semibold text-[#191c1d] hover:bg-[#eceeef] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Edit form */}
          {editOpen && (
            <form onSubmit={saveProfile} className="mt-6 bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-[#e1e3e4]">
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
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#00464d] text-white rounded-xl font-bold text-sm hover:bg-[#006069] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-6 py-2.5 bg-[#eceeef] text-[#191c1d] rounded-xl font-bold text-sm hover:bg-[#e1e3e4] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </header>

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Pins + Bio */}
          <section className="lg:col-span-8 space-y-12">

            {/* Active Pins */}
            <div>
              <div className="flex items-center justify-between mb-7">
                <h3 className="text-2xl font-headline font-semibold text-[#191c1d]">Your Active Pins</h3>
                <span className="text-xs text-[#6f7979] font-medium">{activePins.length} active / {myPins.length} total</span>
              </div>

              {myPins.length === 0 ? (
                <div className="border-2 border-dashed border-[#bec8c9] rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-[#6f7979]">
                  <span className="material-symbols-outlined text-4xl opacity-40">add_location</span>
                  <p className="text-sm font-semibold">No pins yet</p>
                  <p className="text-xs opacity-60">Double-click on the map to drop one</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {myPins.map((pin) => (
                    <div
                      key={pin.id}
                      className={`bg-white rounded-xl p-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] transition-all flex flex-col ${!pin.is_active ? "opacity-50" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className="p-3 rounded-full text-xl"
                          style={{ backgroundColor: (pin.categories?.color ?? "#eceeef") + "22" }}
                        >
                          {pin.categories?.icon ?? "📍"}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => togglePin(pin.id, pin.is_active)}
                            className="p-2 hover:bg-[#f2f4f5] rounded-lg transition-colors text-[#3f4949]"
                            title={pin.is_active ? "Hide pin" : "Show pin"}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {pin.is_active ? "visibility" : "visibility_off"}
                            </span>
                          </button>
                          <button
                            onClick={() => deletePin(pin.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#ba1a1a]"
                            title="Delete pin"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>

                      <h4 className="font-headline text-lg font-bold mb-1 text-[#191c1d] truncate">{pin.title}</h4>
                      {pin.description && (
                        <p className="text-[#3f4949] text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
                          {pin.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-auto text-[10px] uppercase tracking-wider text-[#6f7979] font-semibold">
                        {pin.location_name && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            <span className="truncate max-w-[120px]">{pin.location_name}</span>
                          </span>
                        )}
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${pin.is_active ? "bg-cyan-50 text-[#006069]" : "bg-[#f2f4f5] text-[#6f7979]"}`}>
                          {pin.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio / About */}
            <div className="bg-[#f2f4f5] rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-5">
                <span className="material-symbols-outlined text-[14rem]">person</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-headline font-semibold mb-6 text-[#191c1d]">About</h3>
                <p className="text-[#3f4949] leading-relaxed">
                  {profile?.bio || "No bio added yet."}
                </p>
                <p className="mt-4 text-xs text-[#6f7979] font-medium uppercase tracking-widest">
                  @{profile?.username}
                </p>
              </div>
            </div>
          </section>

          {/* Right: Privacy + Stats */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Privacy Settings */}
            <div className="bg-[#e1e3e4]/40 rounded-3xl p-7">
              <h3 className="text-lg font-headline font-semibold mb-5 flex items-center gap-2 text-[#191c1d]">
                <span className="material-symbols-outlined text-[#4c56af]">security</span>
                Privacy Control
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-[#191c1d]">Ghost Mode</p>
                    <p className="text-[11px] text-[#3f4949]">Hide your live location</p>
                  </div>
                  <div className="w-12 h-6 bg-[#006069] rounded-full relative px-1 flex items-center justify-end">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-[#191c1d]">Pin Visibility</p>
                    <p className="text-[11px] text-[#3f4949]">Who can see your pins</p>
                  </div>
                  <select className="bg-transparent border-none text-[#00464d] font-semibold text-sm focus:ring-0 cursor-pointer">
                    <option>Everyone</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-[#191c1d]">Anonymous Chat</p>
                    <p className="text-[11px] text-[#3f4949]">Hide identity in new chats</p>
                  </div>
                  <div className="w-12 h-6 bg-[#006069] rounded-full relative px-1 flex items-center justify-end">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#00464d]/8 bg-cyan-50 p-6 rounded-2xl">
                <p className="text-[10px] text-[#6f7979] uppercase tracking-wider font-semibold mb-2">Active Pins</p>
                <p className="text-3xl font-headline font-bold text-[#00464d]">{activePins.length}</p>
              </div>
              <div className="bg-[#ac004c]/5 bg-rose-50 p-6 rounded-2xl">
                <p className="text-[10px] text-[#6f7979] uppercase tracking-wider font-semibold mb-2">Total Pins</p>
                <p className="text-3xl font-headline font-bold text-[#810037]">{myPins.length}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-3xl overflow-hidden bg-[#191c1d] text-white p-7 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">explore</span>
              </div>
              <div>
                <h4 className="font-headline font-semibold text-base mb-1">Ready to discover?</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  Your active pins are visible. Go explore who's nearby.
                </p>
              </div>
              <a
                href="/map"
                className="w-full py-3 bg-[#006069] text-white rounded-xl font-bold text-sm text-center hover:bg-[#00464d] transition-colors active:scale-95"
              >
                Open Map
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
