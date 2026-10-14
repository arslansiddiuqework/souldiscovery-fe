"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import {
  deleteAssessmentResult,
  fetchAssessmentHistory,
} from "@/lib/api/assessments";

type HistoryItem = {
  resultId: string;
  assessmentSlug: string;
  title: string;
  instrumentVersion: string;
  summary: string;
  interpretationLabel: string | null;
  clinicallyValidated: boolean;
  completedAt: string;
};

export default function AssessmentHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssessmentHistory();
      setHistory(data.history);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onDelete = async (resultId: string) => {
    if (!confirm("Delete this saved assessment result? This cannot be undone.")) return;
    setDeleting(resultId);
    try {
      await deleteAssessmentResult(resultId);
      setHistory((h) => h.filter((item) => item.resultId !== resultId));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9FF] text-[#302B3D]">
      <div className="page-shell pb-20 pt-28">
        <div className="container-app max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7863C6]">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Assessment history</h1>
          <p className="mt-2 text-[#716B7D]">
            Your saved reflections only. Scores from different instrument versions are not compared
            automatically.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/assessments"
              className="rounded-full bg-[#B74783] px-5 py-2.5 text-sm font-bold text-white"
            >
              Assessment Center
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[#EADCE5] bg-white px-5 py-2.5 text-sm font-bold text-[#49263D]"
            >
              Back to dashboard
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-[#EADCE5] bg-white p-6 text-center">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-3 font-semibold text-[#B74783]"
              >
                Retry
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#EADCE5] bg-white/70 p-10 text-center text-[#716B7D]">
              No saved assessments yet. Complete a reflection and choose to save it.
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {history.map((item) => (
                <li
                  key={item.resultId}
                  className="rounded-2xl border border-[#E9E2F2] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{item.title}</h2>
                      <p className="mt-1 text-xs text-[#927C8B]">
                        {new Date(item.completedAt).toLocaleString()} · Version{" "}
                        {item.instrumentVersion}
                        {item.clinicallyValidated ? "" : " · Non-clinical reflection"}
                      </p>
                      <p className="mt-2 text-sm text-[#716B7D] line-clamp-3">{item.summary}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/assessments/results/${item.resultId}`}
                        className="rounded-full border border-[#EADCE5] px-4 py-2 text-sm font-semibold text-[#49263D] hover:bg-[#FFF0F6]"
                      >
                        View results
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onDelete(item.resultId)}
                        disabled={deleting === item.resultId}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-[#B4233D] hover:bg-[#FFF0F2] disabled:opacity-50"
                        aria-label={`Delete ${item.title} result`}
                      >
                        {deleting === item.resultId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
