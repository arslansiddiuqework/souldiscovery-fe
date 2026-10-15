"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodos } from "@/lib/todo/use-todos";
import { startOfDayIso, toDateKey } from "@/lib/todo/storage";
import {
  TODO_PRIORITIES,
  type TodoItem,
  type TodoPriority,
} from "@/lib/todo/types";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const PILL_TONES: Record<TodoPriority, string> = {
  low: "bg-[#EEF4FF] text-[#315FC2]",
  medium: "bg-[#F4E8FF] text-[#7A4FB0]",
  high: "bg-[#FFF0F6] text-[#B74783]",
};

const DOT_TONES: Record<TodoPriority, string> = {
  low: "bg-[#315FC2]",
  medium: "bg-[#B74783]",
  high: "bg-[#E85D4C]",
};

const ACCENT_BAR: Record<TodoPriority, string> = {
  low: "bg-[#7EB6FF]",
  medium: "bg-[#C9A0E8]",
  high: "bg-[#F2A0C0]",
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarDays(month: Date) {
  const first = startOfMonth(month);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    return day;
  });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "2-digit" });
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDayShort(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
  });
}

export function DashboardPlanner() {
  const reduceMotion = useReducedMotion();
  const {
    ready,
    addTodo,
    toggleTodo,
    removeTodo,
    getTodosForDate,
    datesWithTodos,
  } = useTodos();

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [adding, setAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftPriority, setDraftPriority] = useState<TodoPriority>("medium");

  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const dayTodos = getTodosForDate(selectedDate);
  const previewTodos = dayTodos.filter((t) => !t.completed).slice(0, 3);
  const doneCount = dayTodos.filter((t) => t.completed).length;
  const totalCount = dayTodos.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(selectedDate);

  const shiftMonth = (delta: number) => {
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const submitTask = () => {
    const title = draftTitle.trim();
    if (!title) return;
    addTodo(title, {
      priority: draftPriority,
      dueDate: startOfDayIso(selectedDate),
    });
    setDraftTitle("");
    setDraftPriority("medium");
    setAdding(false);
  };

  return (
    <div className="flex w-full max-w-[640px] flex-col items-stretch gap-3.5 sm:flex-row">
      {/* Calendar card — compact square */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-full max-w-[300px] shrink-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_18px_44px_rgba(123,57,98,0.10)] ring-1 ring-[#EADCE5]/80 sm:mx-0"
      >
        <div className="flex items-center justify-between px-3.5 pb-1.5 pt-3.5">
          <h3 className="font-display text-lg font-bold tracking-tight text-[#49263D]">
            {formatMonthYear(viewMonth)}
          </h3>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#B74783]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#B74783]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid aspect-square grid-cols-7 content-start gap-y-0.5 px-2.5 pb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-0.5 text-center text-[10px] font-semibold text-[#927C8B]"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = toDateKey(day);
            const inMonth = day.getMonth() === viewMonth.getMonth();
            const selected = key === selectedKey;
            const isToday = key === todayKey;
            const marks = datesWithTodos.get(key) || [];
            const accent = marks[0];

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(new Date(day))}
                className={cn(
                  "relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98CB4]",
                  !inMonth && "text-[#C9B8C4]",
                  inMonth && !selected && "text-[#49263D] hover:bg-[#FFF0F6]",
                  isToday && !selected && "ring-1 ring-[#D9B8F5]",
                  selected &&
                    "bg-[#B74783] text-white shadow-[0_8px_18px_rgba(183,71,131,0.35)]",
                  accent === "high" &&
                    !selected &&
                    "bg-[#FFE5F0] text-[#B74783]",
                  accent === "low" &&
                    !selected &&
                    marks.length > 0 &&
                    "bg-[#EAF7EF] text-[#287D58]"
                )}
              >
                {day.getDate()}
                {marks.length > 0 && !selected && (
                  <span className="absolute bottom-0.5 flex gap-0.5">
                    {Array.from(new Set(marks))
                      .slice(0, 3)
                      .map((p) => (
                        <span
                          key={p}
                          className={cn("h-1 w-1 rounded-full", DOT_TONES[p])}
                        />
                      ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[#F1E9EF] px-3 py-2.5">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#927C8B]">
            {formatDayLabel(selectedDate)}
          </p>
          {previewTodos.length === 0 ? (
            <p className="rounded-xl bg-[#FBF9FF] px-2.5 py-2 text-[11px] text-[#927C8B]">
              No plans yet — add a soft task for this day.
            </p>
          ) : (
            <div className="space-y-1.5">
              {previewTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-[11px] font-semibold",
                    PILL_TONES[todo.priority]
                  )}
                >
                  <span className="truncate">{todo.title}</span>
                  <span className="shrink-0 text-[9px] font-bold opacity-70">
                    {TODO_PRIORITIES.find((p) => p.id === todo.priority)?.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Tasks card — matches calendar height */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: reduceMotion ? 0 : 0.06,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative mx-auto flex w-full max-w-[300px] flex-1 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_18px_44px_rgba(123,57,98,0.10)] ring-1 ring-[#EADCE5]/80 sm:mx-0 sm:max-w-none"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FFF0F6]/90 via-[#FBF9FF]/40 to-transparent" />

        <div className="relative flex items-start justify-between gap-3 px-4 pb-3 pt-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold tracking-tight text-[#49263D]">
                Tasks
              </h3>
              {totalCount > 0 && (
                <span className="rounded-full bg-[#F4E8FF] px-2 py-0.5 text-[10px] font-bold text-[#7A4FB0]">
                  {doneCount}/{totalCount}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-[#927C8B]">
              {formatDayShort(selectedDate)}
            </p>
            {totalCount > 0 && (
              <div className="mt-2.5 h-1.5 w-28 overflow-hidden rounded-full bg-[#F1E9EF]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Add task"
            onClick={() => setAdding((v) => !v)}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-[0_10px_22px_rgba(183,71,131,0.34)] transition hover:scale-[1.04] active:scale-[0.97]",
              adding
                ? "bg-[#795A70]"
                : "bg-gradient-to-br from-[#C45A92] to-[#B74783]"
            )}
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {adding && (
            <motion.div
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              className="relative overflow-hidden px-3"
            >
              <div className="relative mb-2.5 overflow-hidden rounded-[22px] bg-white p-3 shadow-[0_10px_28px_rgba(123,57,98,0.08)] ring-1 ring-[#EADCE5]/90">
                <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.16),transparent_70%)]" />
                <div className="pointer-events-none absolute -bottom-8 -left-4 h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(183,71,131,0.08),transparent_70%)]" />

                <p className="relative mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#B74783]">
                  New for {formatDayLabel(selectedDate)}
                </p>

                <label className="relative block">
                  <span className="sr-only">Task title</span>
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitTask();
                      }
                    }}
                    placeholder="What do you want to do?"
                    className="w-full rounded-xl border border-[#F1E9EF] bg-[#FBF9FF] px-3 py-2.5 text-sm font-semibold text-[#49263D] outline-none transition placeholder:font-medium placeholder:text-[#C9B8C4] focus:border-[#E8B4D0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(183,71,131,0.12)]"
                  />
                </label>

                <div className="relative mt-3">
                  <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#927C8B]">
                    Pace
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#F7F3F8] p-1">
                    {TODO_PRIORITIES.map((p) => {
                      const active = draftPriority === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setDraftPriority(p.id)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-xl px-1.5 py-2 text-[10px] font-bold transition",
                            active
                              ? "bg-white text-[#49263D] shadow-[0_4px_12px_rgba(123,57,98,0.12)]"
                              : "text-[#927C8B] hover:text-[#795A70]"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              p.dot,
                              !active && "opacity-45"
                            )}
                          />
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={submitTask}
                  disabled={!draftTitle.trim()}
                  className="relative mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#C45A92] to-[#B74783] px-3 py-2.5 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(183,71,131,0.28)] transition hover:brightness-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Add task
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
          {!ready ? (
            <div className="space-y-2 px-1 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl bg-[#F7E8F3]/45"
                />
              ))}
            </div>
          ) : dayTodos.length === 0 ? (
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-2xl bg-[#FBF9FF]/70 px-4 py-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF0F6] to-[#F4E8FF] text-[#B74783] shadow-[inset_0_0_0_1px_rgba(234,220,229,0.8)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-[#49263D]">Clear day</p>
              <p className="mt-1 max-w-[180px] text-[11px] leading-relaxed text-[#927C8B]">
                Tap + to plan something gentle for this date.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5 pt-0.5">
              <AnimatePresence initial={false}>
                {dayTodos.map((todo) => (
                  <PlannerTaskRow
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onRemove={removeTodo}
                    reduceMotion={!!reduceMotion}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function PlannerTaskRow({
  todo,
  onToggle,
  onRemove,
  reduceMotion,
}: {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  reduceMotion: boolean;
}) {
  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
      className={cn(
        "group relative flex items-start gap-3 overflow-hidden rounded-2xl px-2.5 py-3 transition",
        todo.completed
          ? "bg-[#FBF9FF]/60"
          : "bg-white hover:bg-[#FFF8FB]"
      )}
    >
      <span
        className={cn(
          "absolute inset-y-2 left-0 w-1 rounded-full",
          ACCENT_BAR[todo.priority],
          todo.completed && "opacity-30"
        )}
      />
      <button
        type="button"
        aria-label={todo.completed ? "Mark incomplete" : "Complete task"}
        onClick={() => onToggle(todo.id)}
        className={cn(
          "mt-0.5 ml-1.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition",
          todo.completed
            ? "border-[#B74783] bg-[#B74783] text-white shadow-[0_4px_10px_rgba(183,71,131,0.28)]"
            : "border-[#D9B8F5] bg-white hover:border-[#B74783] hover:bg-[#FFF0F6]"
        )}
      >
        {todo.completed && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1 pr-1">
        <p
          className={cn(
            "text-[13px] font-bold leading-snug text-[#49263D]",
            todo.completed &&
              "text-[#A8939E] line-through decoration-[#DFC7D6]"
          )}
        >
          {todo.title}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[11px] leading-snug text-[#927C8B]",
            todo.completed && "text-[#C9B8C4]"
          )}
        >
          {todo.notes ||
            TODO_PRIORITIES.find((p) => p.id === todo.priority)?.label}
        </p>
      </div>
      <button
        type="button"
        aria-label="Delete task"
        onClick={() => onRemove(todo.id)}
        className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[#C9B8C4] opacity-0 transition hover:bg-[#FFF0F2] hover:text-[#B4233D] group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.li>
  );
}
