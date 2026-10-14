"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, CheckCircle } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  duration: number;
  scheduledFor: Date;
  completedAt?: Date;
}

interface ActivityListProps {
  activities: Activity[];
  onStatusUpdate: (activityId: string, status: string) => Promise<void>;
}

export function ActivityList({
  activities,
  onStatusUpdate,
}: ActivityListProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (activityId: string, newStatus: string) => {
    setUpdating(activityId);
    try {
      await onStatusUpdate(activityId, newStatus);
    } finally {
      setUpdating(null);
    }
  };

  if (!activities.length) {
    return (
      <div className="rounded-[16px] border border-dashed border-[#EADCE5] bg-white py-10 text-center text-[#927C8B]">
        <p className="text-sm">No activities scheduled for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="rounded-[16px] border border-[#EADCE5] bg-white p-4 shadow-card transition-all duration-300 hover:border-[#B74783]/25 hover:bg-[#FFF0F6] hover:shadow-card-hover"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFE5F0]">
                <Timer className="h-5 w-5 text-[#B74783]" />
              </div>
              <div className="min-w-0">
                <h4 className="truncate font-display text-sm font-semibold text-[#49263D]">
                  {activity.title}
                </h4>
                <p className="text-sm text-[#927C8B]">
                  {new Date(activity.scheduledFor).toLocaleTimeString()} -{" "}
                  {activity.duration} mins
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {activity.status === "completed" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-500"
                  disabled
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Completed
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#EADCE5]"
                    onClick={() => handleStatusUpdate(activity.id, "completed")}
                    disabled={updating === activity.id}
                  >
                    Complete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusUpdate(activity.id, "skipped")}
                    disabled={updating === activity.id}
                  >
                    Skip
                  </Button>
                </>
              )}
            </div>
          </div>
          {activity.description && (
            <p className="mt-2 text-sm leading-relaxed text-[#927C8B]">
              {activity.description}
            </p>
          )}
          {activity.status === "in_progress" && (
            <Progress value={50} className="mt-3 h-1.5" />
          )}
        </div>
      ))}
    </div>
  );
}
