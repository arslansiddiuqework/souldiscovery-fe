export type TodoPriority = "low" | "medium" | "high";

export interface TodoItem {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  priority: TodoPriority;
  dueDate?: string | null;
  createdAt: string;
  completedAt?: string | null;
  updatedAt: string;
}

export type TodoFilter = "all" | "active" | "done" | "today";

export const TODO_PRIORITIES: {
  id: TodoPriority;
  label: string;
  tint: string;
  dot: string;
}[] = [
  { id: "low", label: "Gentle", tint: "bg-[#EEF4FF] text-[#315FC2]", dot: "bg-[#315FC2]" },
  { id: "medium", label: "Steady", tint: "bg-[#F4E8FF] text-[#7A4FB0]", dot: "bg-[#B74783]" },
  { id: "high", label: "Focus", tint: "bg-[#FFF0F6] text-[#B74783]", dot: "bg-[#B74783]" },
];
