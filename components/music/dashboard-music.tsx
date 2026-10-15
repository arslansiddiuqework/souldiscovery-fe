"use client";

import { useEffect, useState } from "react";
import { getDashboardMusic, SpotifyPlaylist } from "@/lib/api/music";
import { SpotifyCard } from "./spotify-card";
import { Loader2, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DashboardMusic({ compact = false }: { compact?: boolean }) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchMusic() {
      setLoading(true);
      try {
        const response = await getDashboardMusic();
        if (response.success) {
          setPlaylists(response.playlists);
          setQuery(response.query);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard music:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMusic();
  }, []);

  if (compact) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#EADCE5]/90 bg-white/88 p-3.5 shadow-[0_8px_28px_rgba(123,57,98,0.06)] backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1DB954]/15">
            <Music className="h-4 w-4 text-[#1DB954]" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-[#49263D]">
              Music for you
            </p>
            <p className="truncate text-[11px] text-[#927C8B]">
              {query ? `Mood: ${query}` : "Curated for your mood"}
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full min-h-[120px] items-center justify-center rounded-2xl border border-[#EADCE5] bg-white">
              <Loader2 className="h-5 w-5 animate-spin text-[#B74783]" />
            </div>
          ) : playlists.length > 0 ? (
            <div className="h-full overflow-hidden rounded-2xl border border-[#EADCE5] bg-[#121212]">
              <SpotifyCard playlists={playlists.slice(0, 1)} />
            </div>
          ) : (
            <div className="flex h-full min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-[#EADCE5] bg-white px-3 text-center">
              <p className="text-xs text-[#927C8B]">Music unavailable</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1DB954]/15">
            <Music className="h-5 w-5 text-[#1DB954]" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg md:text-xl">Music For You</CardTitle>
            <CardDescription>
              Curated playlists based on your recent mood tracking
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {loading ? (
          <div className="flex h-48 flex-col items-center justify-center space-y-3 rounded-[16px] border border-[#EADCE5] bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#B74783]" />
            <p className="text-sm text-[#927C8B]">
              Curating your sounds...
            </p>
          </div>
        ) : playlists.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[#927C8B]">
              Because your mood indicates a need for{" "}
              <span className="font-semibold text-[#49263D]">{query}</span>:
            </p>
            <div className="overflow-hidden rounded-[16px] border border-[#EADCE5] bg-[#121212] shadow-card">
              <SpotifyCard playlists={playlists} />
            </div>
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-[16px] border border-dashed border-[#EADCE5] bg-white px-4 text-center">
            <Music className="mb-3 h-10 w-10 text-[#927C8B]/30" />
            <p className="text-sm leading-relaxed text-[#927C8B]">
              We couldn&apos;t fetch music recommendations right now. Please try
              again later.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
