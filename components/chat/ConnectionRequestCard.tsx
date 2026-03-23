"use client";

import { Button } from "@/components/ui/button";
import { UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  connectionId: string;
  isIncoming: boolean;
  status?: "pending" | "accepted" | "declined";
  onAction: (action: "accept" | "decline") => Promise<void>;
}

export default function ConnectionRequestCard({ connectionId, isIncoming, status, onAction }: Props) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function handleAction(action: "accept" | "decline") {
    setLoading(action);
    await onAction(action);
    setLoading(null);
  }

  if (status === "accepted") {
    return (
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4" />
          Identities revealed — you are now connected!
        </div>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full">
          <XCircle className="w-4 h-4" />
          Connection request declined
        </div>
      </div>
    );
  }

  if (!isIncoming && status === "pending") {
    return (
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
          <Clock className="w-4 h-4" />
          Waiting for the other person to accept...
        </div>
      </div>
    );
  }

  if (isIncoming && status === "pending") {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 max-w-sm w-full">
          <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm mb-2">
            <UserCheck className="w-4 h-4" />
            Identity reveal request
          </div>
          <p className="text-xs text-gray-500 mb-3">
            The other person wants to reveal their identity. If you accept, you&apos;ll both be able to see each other&apos;s names and profiles.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"
              onClick={() => handleAction("accept")}
              disabled={loading !== null}
            >
              {loading === "accept" ? "..." : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={() => handleAction("decline")}
              disabled={loading !== null}
            >
              {loading === "decline" ? "..." : "Decline"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
