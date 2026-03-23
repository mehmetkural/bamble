"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading groups...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-900">Groups</h1>
        <Button
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
          <Users className="w-12 h-12 opacity-30" />
          <p className="text-sm">No groups yet</p>
          <p className="text-xs text-gray-300">Create one after connecting with people on the map!</p>
        </div>
      ) : (
        <div className="divide-y">
          {groups.map((group) => {
            const memberCount = group.group_members?.[0]?.count ?? 0;
            const isJoined = myGroupIds.has(group.id);

            return (
              <div
                key={group.id}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: group.categories?.color + "20" }}
                >
                  {group.categories?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">{group.name}</p>
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0"
                      style={{
                        backgroundColor: group.categories?.color + "15",
                        color: group.categories?.color,
                      }}
                    >
                      {group.categories?.label}
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{group.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      {memberCount} member{memberCount !== 1 ? "s" : ""}
                    </span>
                    {group.location_name && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {group.location_name}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isJoined ? "secondary" : "default"}
                  className={`shrink-0 ${!isJoined ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  onClick={() => isJoined ? router.push(`/groups/${group.id}`) : joinGroup(group.id)}
                >
                  {isJoined ? "View" : "Join"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { fetchGroups(); setCreateOpen(false); }}
      />
    </div>
  );
}
