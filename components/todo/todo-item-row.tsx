"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TODO_PRIORITIES, type TodoItem } from "@/lib/todo/types";
import { isDueToday } from "@/lib/todo/storage";

interface TodoItemRowProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function TodoItemRow({
  todo,
  onToggle,
  onRemove,
  compact = false,
}: TodoItemRowProps) {
  const reduceMotion = useReducedMotion();
  const priority = TODO_PRIORITIES.find((p) => p.id === todo.priority);
  const dueToday = isDueToday(todo);

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border border-[#EADCE5] bg-white/95 shadow-[0_6px_18px_rgba(123,57,98,0.05)] transition hover:border-[#DFC7D6] hover:shadow-[0_10px_24px_rgba(123,57,98,0.08)]",
        compact ? "px-3 py-2.5" : "px-3.5 py-3.5",
        todo.completed && "bg-[#FBF9FF]/80"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? `Mark “${todo.title}” as open` : `Complete “${todo.title}”`}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
          todo.completed
            ? "border-[#B74783] bg-[#B74783] text-white"
            : "border-[#DFC7D6] bg-white hover:border-[#B74783]"
        )}
      >
        {todo.completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold leading-snug text-[#49263D]",
            todo.completed && "text-[#927C8B] line-through decoration-[#DFC7D6]"
          )}
        >
          {todo.title}
        </p>
        {!compact && todo.notes && (
          <p className="mt-1 text-xs leading-relaxed text-[#927C8B]">{todo.notes}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {priority && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                priority.tint
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </span>
          )}
          {dueToday && !todo.completed && (
            <span className="rounded-full bg-[#FFF5D9] px-2 py-0.5 text-[10px] font-bold text-[#946200]">
              Today
            </span>
          )}
          {todo.completed && todo.completedAt && (
            <span className="text-[10px] font-medium text-[#927C8B]">
              Done {new Date(todo.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(todo.id)}
        aria-label={`Delete “${todo.title}”`}
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#927C8B] opacity-100 transition hover:bg-[#FFF0F2] hover:text-[#B4233D] sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
