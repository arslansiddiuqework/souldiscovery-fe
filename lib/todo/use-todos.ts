"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/contexts/session-context";
import {
  createTodo,
  isDueToday,
  loadTodos,
  saveTodos,
  sortTodos,
  toDateKey,
  todosOnDate,
} from "./storage";
import type { TodoFilter, TodoItem, TodoPriority } from "./types";

export function useTodos() {
  const { user } = useSession();
  const userId = user?._id || null;
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTodos(loadTodos(userId));
    setReady(true);
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    saveTodos(todos, userId);
  }, [todos, userId, ready]);

  const addTodo = useCallback(
    (
      title: string,
      options?: { priority?: TodoPriority; dueDate?: string | null; notes?: string }
    ) => {
      const trimmed = title.trim();
      if (!trimmed) return null;
      const item = createTodo(trimmed, options);
      setTodos((prev) => [item, ...prev]);
      return item;
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo;
        const completed = !todo.completed;
        return {
          ...todo,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updateTodo = useCallback((id: string, patch: Partial<TodoItem>) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, ...patch, updatedAt: new Date().toISOString() }
          : todo
      )
    );
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.completed).length;
    const active = total - done;
    const today = todos.filter((t) => !t.completed && isDueToday(t)).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, active, today, percent };
  }, [todos]);

  const filterTodos = useCallback(
    (filter: TodoFilter) => {
      let list = todos;
      if (filter === "active") list = todos.filter((t) => !t.completed);
      if (filter === "done") list = todos.filter((t) => t.completed);
      if (filter === "today") {
        list = todos.filter((t) => !t.completed && (isDueToday(t) || !t.dueDate));
      }
      return sortTodos(list);
    },
    [todos]
  );

  const getTodosForDate = useCallback(
    (date: Date) => sortTodos(todosOnDate(todos, date)),
    [todos]
  );

  const datesWithTodos = useMemo(() => {
    const map = new Map<string, TodoPriority[]>();
    for (const todo of todos) {
      if (!todo.dueDate) continue;
      const key = toDateKey(todo.dueDate);
      const list = map.get(key) || [];
      list.push(todo.priority);
      map.set(key, list);
    }
    return map;
  }, [todos]);

  return {
    todos,
    ready,
    stats,
    addTodo,
    toggleTodo,
    updateTodo,
    removeTodo,
    clearCompleted,
    filterTodos,
    getTodosForDate,
    datesWithTodos,
  };
}
