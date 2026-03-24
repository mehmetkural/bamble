"use client";

import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  selected: string | null;
  onChange: (slug: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <button
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border shadow-sm transition-colors whitespace-nowrap",
          !selected
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onChange(selected === cat.slug ? null : cat.slug)}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border shadow-sm transition-colors whitespace-nowrap",
            selected === cat.slug
              ? "text-white border-transparent"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          )}
          style={selected === cat.slug ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
