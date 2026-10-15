import type { Metadata } from "next";
import { TodoApp } from "@/components/todo/todo-app";
import { BRAND_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `To-Do List | ${BRAND_NAME}`,
  description: "A calm, modern to-do list for small daily intentions.",
};

export default function TodoPage() {
  return <TodoApp />;
}
