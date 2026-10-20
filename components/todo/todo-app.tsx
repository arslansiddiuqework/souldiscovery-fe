"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ListTodo,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTodos } from "@/lib/todo/use-todos";
import type { TodoFilter } from "@/lib/todo/types";
import { TodoComposer } from "./todo-composer";
import { TodoItemRow } from "./todo-item-row";

const FILTERS: { id: TodoFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Open" },
  { id: "today", label: "Today" },
  { id: "done", label: "Done" },
];

export function TodoApp() {
  const reduceMotion = useReducedMotion();
  const {
    ready,
    stats,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted,
    filterTodos,
  } = useTodos();
  const [filter, setFilter] = useState<TodoFilter>("active");
  const items = filterTodos(filter);

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(217,184,245,0.35),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(247,232,243,0.8),transparent_70%)] blur-2xl"
      />

      <Link
        href="/dashboard"
        className="relative inline-flex items-center gap-2 text-sm font-medium text-[#B74783] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <header className="relative mt-6 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EADCE5] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B74783] shadow-sm">
          <ListTodo className="h-3.5 w-3.5" />
          Soft focus list
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#49263D] sm:text-4xl">
          To-Do List
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#795A70] sm:text-base">
          Small intentions, gently tracked. Add what matters — no pressure to finish everything today.
        </p>
      </header>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-5 overflow-hidden rounded-[28px] border border-[#EADCE5] bg-gradient-to-br from-white via-[#FFF8FB] to-[#F4E8FF] p-5 shadow-[0_14px_40px_rgba(123,57,98,0.08)] sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#927C8B]">
              Today&apos;s rhythm
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[#49263D]">
              {stats.done}
              <span className="text-base font-semibold text-[#927C8B]">
                {" "}
                / {stats.total} complete
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="relative h-14 w-14"
              role="img"
              aria-label={`${stats.percent}% complete`}
            >
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#EADCE5"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#B74783"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.percent} 100`}
                  className="transition-[stroke-dasharray] duration-500 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#49263D]">
                {stats.percent}%
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Open", value: stats.active },
            { label: "Due today", value: stats.today },
            { label: "Done", value: stats.done },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/80 bg-white/70 px-3 py-2.5 text-center backdrop-blur-sm"
            >
              <p className="font-display text-lg font-bold text-[#49263D]">
                {card.value}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#927C8B]">
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="relative mb-4">
        <TodoComposer onAdd={(title, options) => addTodo(title, options)} />
      </div>

      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex gap-1.5 overflow-x-auto rounded-full border border-[#EADCE5] bg-white/90 p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter to-dos"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                filter === f.id
                  ? "bg-[#B74783] text-white shadow-[0_6px_14px_rgba(183,71,131,0.28)]"
                  : "text-[#795A70] hover:bg-[#FFF0F6]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {stats.done > 0 && (
          <button
            type="button"
            onClick={clearCompleted}
            className="text-xs font-semibold text-[#927C8B] hover:text-[#B74783] hover:underline"
          >
            Clear completed
          </button>
        )}
      </div>

      <section className="relative space-y-2.5" aria-live="polite">
        {!ready ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-2xl border border-[#EADCE5] bg-white/70"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#DFC7D6] bg-white/70 px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4E8FF] text-[#B74783]">
              {filter === "done" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>
            <p className="font-display text-lg font-bold text-[#49263D]">
              {filter === "done"
                ? "No completed items yet"
                : filter === "today"
                  ? "Nothing tagged for today"
                  : "Your list is clear"}
            </p>
            <p className="mx-auto mt-1 max-w-[34ch] text-sm text-[#927C8B]">
              {filter === "done"
                ? "Completed tasks will gather here like soft milestones."
                : "Add one small step — progress often starts quietly."}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((todo) => (
              <TodoItemRow
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onRemove={removeTodo}
              />
            ))}
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
