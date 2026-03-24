"use client";

import type { PinPublic } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  pin: PinPublic;
  userId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function PinPopup({ pin, userId, onClose, onDeleted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = pin.user_id === userId;

  async function deletePin() {
    setDeleting(true);
    const res = await fetch(`/api/pins/${pin.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Pin silindi.");
      onClose();
      onDeleted?.();
    } else {
      toast.error("Pin silinemedi.");
    }
    setDeleting(false);
    setConfirmDelete(false);
  }

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
        <div className="ml-auto flex items-center gap-1.5">
          {isOwner && !confirmDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
              title="Pini sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          {!confirmDelete && (
            <Button
              size="sm"
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 h-7 text-xs"
              onClick={startChat}
              disabled={loading}
            >
              <MessageCircle className="w-3 h-3" />
              {loading ? "..." : "Chat"}
            </Button>
          )}
          {confirmDelete && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#596064]">Emin misin?</span>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-slate-500" onClick={() => setConfirmDelete(false)}>İptal</Button>
              <Button size="sm" className="h-7 px-2 text-xs bg-red-500 hover:bg-red-600" onClick={deletePin} disabled={deleting}>
                {deleting ? "..." : "Sil"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
