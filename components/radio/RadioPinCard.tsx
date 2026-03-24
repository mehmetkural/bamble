"use client";

import type { PinPublic } from "@/types/database";
import { MapPin, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RadioPinCard({ pin }: { pin: PinPublic }) {
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
      router.push(`/chat/${conversation_id}`);
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to start chat");
    }
    setLoading(false);
  }

  return (
    <div className="mx-4 my-1 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className="w-3 h-3 text-indigo-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Active Pin</span>
      </div>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 shadow-sm"
          style={{ backgroundColor: pin.category_color + "25" }}
        >
          {pin.category_icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#2c3437] text-sm leading-tight" style={{ fontFamily: "var(--font-headline)" }}>
            {pin.title}
          </p>
          {pin.description && (
            <p className="text-xs text-[#596064] mt-0.5 line-clamp-2">{pin.description}</p>
          )}
          {pin.location_name && (
            <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {pin.location_name}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: pin.category_color + "20", color: pin.category_color }}
        >
          {pin.category_label}
        </span>
        <button
          onClick={startChat}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50"
        >
          <MessageCircle className="w-3 h-3" />
          {loading ? "..." : "Chat privately"}
        </button>
      </div>
    </div>
  );
}
