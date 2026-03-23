"use client";

import type { GroupPinPublic } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  group: GroupPinPublic;
  userId: string;
  onClose: () => void;
}

export default function GroupPinPopup({ group, userId, onClose }: Props) {
  const router = useRouter();

  return (
    <div className="p-1 min-w-[200px] max-w-[260px]">
      <div className="flex items-start gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: group.category_color + "20" }}
        >
          {group.category_icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{group.name}</p>
          {group.description && (
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{group.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
        <Users className="w-3 h-3" />
        <span>{group.member_count} member{group.member_count !== 1 ? "s" : ""}</span>
      </div>

      {group.location_name && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{group.location_name}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="text-xs"
          style={{ backgroundColor: group.category_color + "15", color: group.category_color }}
        >
          {group.category_label}
        </Badge>
        <Button
          size="sm"
          className="ml-auto gap-1.5 bg-indigo-600 hover:bg-indigo-700 h-7 text-xs"
          onClick={() => { onClose(); router.push(`/groups/${group.id}`); }}
        >
          View Group
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
