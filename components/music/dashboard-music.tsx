"use client";

import { useEffect, useState } from "react";
import { getDashboardMusic, SpotifyPlaylist } from "@/lib/api/music";
import { SpotifyCard } from "./spotify-card";
import { Loader2, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DashboardMusic() {
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
          <div className="flex h-48 flex-col items-center justify-center space-y-3 rounded-[16px] border border-[rgba(216,191,227,0.18)] bg-white/[0.03]">
            <Loader2 className="h-8 w-8 animate-spin text-[#b384c9]" />
            <p className="text-sm text-[rgba(231,218,237,0.55)]">
              Curating your sounds...
            </p>
          </div>
        ) : playlists.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
              Because your mood indicates a need for{" "}
              <span className="font-semibold text-white">{query}</span>:
            </p>
            <div className="overflow-hidden rounded-[16px] border border-[rgba(216,191,227,0.18)] bg-[#121212] shadow-card">
              <SpotifyCard playlists={playlists} />
            </div>
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-[16px] border border-dashed border-[rgba(216,191,227,0.18)] bg-white/[0.03] px-4 text-center">
            <Music className="mb-3 h-10 w-10 text-[rgba(231,218,237,0.55)]/30" />
            <p className="text-sm leading-relaxed text-[rgba(231,218,237,0.55)]">
              We couldn&apos;t fetch music recommendations right now. Please try
              again later.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
