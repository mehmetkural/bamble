"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateGroupModal from "./CreateGroupModal";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  description: string | null;
  location_name: string | null;
  is_public: boolean;
  created_at: string;
  categories: { slug: string; label: string; icon: string; color: string };
  group_members: { count: number }[];
}

export default function GroupsClientPage({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  async function fetchGroups() {
    const res = await fetch("/api/groups");
    if (res.ok) {
      const data = await res.json();
      setGroups(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  async function joinGroup(groupId: string) {
    const res = await fetch(`/api/groups/${groupId}/members`, { method: "POST" });
    if (res.ok) {
      toast.success("Joined group!");
      setMyGroupIds((prev) => new Set([...prev, groupId]));
      fetchGroups();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to join");
    }
  }

  return (
    <div className="px-6 md:px-10 pt-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c3437] mb-2" style={{ fontFamily: "var(--font-headline)" }}>Discover Groups</h1>
        <p className="text-[#596064]">See who's gathering around you.</p>
      </div>

      {/* Create button */}
      <button onClick={() => setCreateOpen(true)}
        className="fixed bottom-28 right-6 md:bottom-8 z-40 w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-90 transition-all">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-[#596064]">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
          <span className="material-symbols-outlined text-5xl opacity-30">groups</span>
          <p className="text-sm font-medium">No groups yet</p>
          <p className="text-xs text-center">Create one after connecting with people on the map!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const memberCount = group.group_members?.[0]?.count ?? 0;
            const isJoined = myGroupIds.has(group.id);
            return (
              <div key={group.id} className="bg-white p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                onClick={() => isJoined ? router.push(`/groups/${group.id}`) : undefined}>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: group.categories?.color + "20" }}>
                    {group.categories?.icon}
                  </div>
                  <span className="text-xs text-[#596064]">{group.location_name || "Nearby"}</span>
                </div>
                <h3 className="font-bold text-[#2c3437] text-lg mb-1 truncate" style={{ fontFamily: "var(--font-headline)" }}>{group.name}</h3>
                {group.description && <p className="text-[#596064] text-sm mb-5 line-clamp-2">{group.description}</p>}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold text-indigo-600 uppercase">{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                  <button onClick={(e) => { e.stopPropagation(); isJoined ? router.push(`/groups/${group.id}`) : joinGroup(group.id); }}
                    className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-colors ${isJoined ? "bg-[#eaeff2] text-[#2c3437] hover:bg-[#dce4e8]" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"}`}>
                    {isJoined ? "View" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { fetchGroups(); setCreateOpen(false); }} />
    </div>
  );
}
