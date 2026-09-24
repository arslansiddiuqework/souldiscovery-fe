"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMoodHistory } from "@/lib/api/mood";
import { format, subDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Range = 7 | 30;

export function MoodTrendChart() {
  const [range, setRange] = useState<Range>(7);
  const [data, setData] = useState<{ label: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const start = subDays(new Date(), range);
        const res = await getMoodHistory({
          startDate: start.toISOString(),
          endDate: new Date().toISOString(),
          limit: 100,
        });
        if (!active) return;
        const entries = (res.data || res || []) as any[];
        const list = Array.isArray(entries) ? entries : [];

        // Aggregate by day
        const byDay: Record<string, number[]> = {};
        for (const e of list) {
          const ts = e.timestamp || e.createdAt;
          if (!ts || e.score == null) continue;
          const key = format(new Date(ts), "yyyy-MM-dd");
          if (!byDay[key]) byDay[key] = [];
          byDay[key].push(Number(e.score));
        }

        const points: { label: string; score: number }[] = [];
        for (let i = range - 1; i >= 0; i--) {
          const d = subDays(new Date(), i);
          const key = format(d, "yyyy-MM-dd");
          const scores = byDay[key];
          if (scores?.length) {
            points.push({
              label: format(d, range === 7 ? "EEE" : "MMM d"),
              score: Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length
              ),
            });
          } else {
            points.push({
              label: format(d, range === 7 ? "EEE" : "MMM d"),
              score: 0,
            });
          }
        }
        setData(points);
      } catch {
        if (active) setData([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [range]);

  const hasData = data.some((d) => d.score > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg md:text-xl">Mood Trend</CardTitle>
            <CardDescription>
              Connected with your Soul Discovery mood tracking.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {([7, 30] as Range[]).map((r) => (
              <Button
                key={r}
                size="sm"
                variant="outline"
                onClick={() => setRange(r)}
                className={cn(
                  "h-8 rounded-xl text-xs",
                  range === r &&
                    "border-[#b384c9]/40 bg-[rgba(179,132,201,0.12)] text-[#d8bfe3]"
                )}
              >
                Last {r} Days
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[260px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#b384c9]" />
          </div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-[rgba(231,218,237,0.45)]">
            Track your mood to see trends here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(216,191,227,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(231,218,237,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "rgba(231,218,237,0.45)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(16,11,32,0.95)",
                  border: "1px solid rgba(216,191,227,0.22)",
                  borderRadius: 12,
                  color: "#f3eefa",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#b384c9"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#b384c9" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
