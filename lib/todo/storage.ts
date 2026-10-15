import type { TodoItem, TodoPriority } from "./types";

const BASE_KEY = "aurapulse_todos_v1";

function storageKey(userId?: string | null) {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

function uid() {
  return `todo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadTodos(userId?: string | null): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: TodoItem[], userId?: string | null) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(todos));
}

export function createTodo(
  title: string,
  options?: { priority?: TodoPriority; dueDate?: string | null; notes?: string }
): TodoItem {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: title.trim(),
    notes: options?.notes?.trim() || undefined,
    completed: false,
    priority: options?.priority || "medium",
    dueDate: options?.dueDate || null,
    createdAt: now,
    completedAt: null,
    updatedAt: now,
  };
}

export function toDateKey(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: Date | string, b: Date | string) {
  return toDateKey(a) === toDateKey(b);
}

export function isDueToday(todo: TodoItem) {
  if (!todo.dueDate) return false;
  return isSameDay(todo.dueDate, new Date());
}

export function todosOnDate(todos: TodoItem[], date: Date) {
  const key = toDateKey(date);
  return todos.filter((t) => t.dueDate && toDateKey(t.dueDate) === key);
}

export function startOfDayIso(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function sortTodos(todos: TodoItem[]) {
  const rank = { high: 0, medium: 1, low: 2 };
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) return rank[a.priority] - rank[b.priority];
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
