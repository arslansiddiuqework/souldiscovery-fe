"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TODO_PRIORITIES, type TodoPriority } from "@/lib/todo/types";

interface TodoComposerProps {
  onAdd: (
    title: string,
    options?: { priority?: TodoPriority; dueDate?: string | null }
  ) => void;
  compact?: boolean;
  placeholder?: string;
}

export function TodoComposer({
  onAdd,
  compact = false,
  placeholder = "Add something kind for today…",
}: TodoComposerProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [dueToday, setDueToday] = useState(false);

  const submit = () => {
    const value = title.trim();
    if (!value) return;
    onAdd(value, {
      priority,
      dueDate: dueToday ? new Date().toISOString() : null,
    });
    setTitle("");
    setDueToday(false);
    setPriority("medium");
  };

  return (
    <div
      className={cn(
        "rounded-[22px] border border-[#EADCE5] bg-white/95 p-3 shadow-[0_8px_24px_rgba(123,57,98,0.06)]",
        !compact && "sm:p-4"
      )}
    >
      <div className="flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          aria-label="New to-do"
          className="h-11 min-w-0 flex-1 rounded-full border border-[#EADCE5] bg-[#FBF9FF] px-4 text-sm text-[#49263D] outline-none transition placeholder:text-[#927C8B] focus:border-[#B74783]/40 focus:ring-2 focus:ring-[#D98CB4]/50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim()}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#B74783] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(183,71,131,0.28)] transition hover:bg-[#9F376F] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus className="h-4 w-4" />
          {!compact && <span>Add</span>}
        </button>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {TODO_PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPriority(p.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                priority === p.id
                  ? `${p.tint} ring-1 ring-[#B74783]/25`
                  : "bg-[#F7E8F3]/60 text-[#795A70] hover:bg-[#FFF0F6]"
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDueToday((v) => !v)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
              dueToday
                ? "bg-[#FFF5D9] text-[#946200] ring-1 ring-[#946200]/20"
                : "bg-[#F7E8F3]/60 text-[#795A70] hover:bg-[#FFF0F6]"
            )}
          >
            Due today
          </button>
        </div>
      )}
    </div>
  );
}
