export interface SpotifyPlaylist {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  spotifyUrl: string;
}

export interface DashboardMusicResponse {
  success: boolean;
  query: string;
  playlists: SpotifyPlaylist[];
}

export type RelaxationCategoryId =
  | "rain-nature"
  | "calm-piano"
  | "meditation"
  | "sleep-unwind"
  | "ambient";

export type RelaxationTrack = {
  id: string;
  source: "freesound" | "local";
  title: string;
  duration: number;
  creator: string;
  category: RelaxationCategoryId;
  previewUrl: string;
  artworkUrl: string | null;
  pageUrl: string | null;
  tags: string[];
  licence: string;
  licenceUrl: string;
  commercialUseAllowed: boolean;
  attributionRequired: boolean;
  attributionText: string;
};

export type RelaxationLibraryResponse = {
  success: boolean;
  category: RelaxationCategoryId;
  categories: Array<{ id: RelaxationCategoryId; label: string }>;
  tracks: RelaxationTrack[];
  count: number;
  page: number;
  pageSize: number;
  source: "freesound" | "local";
  fallback?: boolean;
  freesoundConfigured?: boolean;
  attributionNotice?: string;
  error?: string;
};

const getAuthHeader = (): Record<string, string> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDashboardMusic = async (): Promise<DashboardMusicResponse> => {
  try {
    const response = await fetch(`/api/music/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard music");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard music:", error);
    return { success: false, query: "", playlists: [] };
  }
};

export const getRelaxationLibrary = async (opts?: {
  category?: RelaxationCategoryId;
  page?: number;
  pageSize?: number;
}): Promise<RelaxationLibraryResponse> => {
  try {
    const qs = new URLSearchParams();
    if (opts?.category) qs.set("category", opts.category);
    if (opts?.page) qs.set("page", String(opts.page));
    if (opts?.pageSize) qs.set("pageSize", String(opts.pageSize));

    const response = await fetch(
      `/api/music/relaxation${qs.toString() ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        cache: "no-store",
      }
    );

    const data = (await response.json()) as RelaxationLibraryResponse;
    if (!response.ok) {
      return {
        success: false,
        category: opts?.category || "rain-nature",
        categories: [],
        tracks: [],
        count: 0,
        page: 1,
        pageSize: 0,
        source: "local",
        error: data.error || "Failed to load relaxation music",
      };
    }
    return data;
  } catch (error) {
    console.error("Error fetching relaxation library:", error);
    return {
      success: false,
      category: opts?.category || "rain-nature",
      categories: [],
      tracks: [],
      count: 0,
      page: 1,
      pageSize: 0,
      source: "local",
      error: "Offline or unreachable",
    };
  }
};
