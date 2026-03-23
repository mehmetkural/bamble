"use client";

import type { PinPublic } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  pin: PinPublic;
  userId: string;
  onClose: () => void;
}

export default function PinPopup({ pin, userId, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin_id: pin.id }),
    });
    if (res.ok) {
      const { conversation_id } = await res.json();
      onClose();
      router.push(`/chat/${conversation_id}`);
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to start chat");
    }
    setLoading(false);
  }

  return (
    <div className="p-1 min-w-[200px] max-w-[260px]">
      <div className="flex items-start gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: pin.category_color + "20" }}
        >
          {pin.category_icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{pin.title}</p>
          {pin.description && (
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{pin.description}</p>
          )}
        </div>
      </div>

      {pin.location_name && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{pin.location_name}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="text-xs"
          style={{ backgroundColor: pin.category_color + "15", color: pin.category_color }}
        >
          {pin.category_label}
        </Badge>
        <Button
          size="sm"
          className="ml-auto gap-1.5 bg-indigo-600 hover:bg-indigo-700 h-7 text-xs"
          onClick={startChat}
          disabled={loading}
        >
          <MessageCircle className="w-3 h-3" />
          {loading ? "..." : "Chat"}
        </Button>
      </div>
    </div>
  );
}
