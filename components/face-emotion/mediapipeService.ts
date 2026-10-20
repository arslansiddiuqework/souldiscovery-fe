/**
 * mediapipeService.ts
 * Singleton service for MediaPipe FaceLandmarker.
 * Prefers local WASM + model assets so camera mood starts quickly.
 */

// ── Types ──────────────────────────────────────────────────────────
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface LandmarkDetectionResult {
  landmarks: NormalizedLandmark[];
  blendshapes?: { categoryName: string; score: number }[];
  timestamp: number;
}

// ── Local asset paths (fast) with CDN fallback ─────────────────────
const WASM_CDN = "/wasm";
const LOCAL_MODEL_URL = "/models/face_landmarker.task";
const REMOTE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// ── Singleton state ────────────────────────────────────────────────
let landmarkerInstance: any | null = null;
let initPromise: Promise<void> | null = null;
let lastTimestamp = -1;

async function createLandmarker(
  FaceLandmarker: any,
  filesetResolver: any,
  modelAssetPath: string,
  delegate: "GPU" | "CPU"
) {
  return FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath,
      delegate,
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
  });
}

/**
 * Lazily initialise the FaceLandmarker. Safe to call multiple times –
 * concurrent calls await the same promise; subsequent calls return instantly.
 */
export async function initializeLandmarker(): Promise<void> {
  if (landmarkerInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { FaceLandmarker, FilesetResolver } = vision;
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN);

      // Prefer local model; fall back to CDN if missing.
      let modelPath = LOCAL_MODEL_URL;
      try {
        const probe = await fetch(LOCAL_MODEL_URL, { method: "HEAD", cache: "force-cache" });
        if (!probe.ok) modelPath = REMOTE_MODEL_URL;
      } catch {
        modelPath = REMOTE_MODEL_URL;
      }

      try {
        landmarkerInstance = await createLandmarker(
          FaceLandmarker,
          filesetResolver,
          modelPath,
          "GPU"
        );
      } catch {
        // Some devices reject the GPU delegate — retry on CPU.
        landmarkerInstance = await createLandmarker(
          FaceLandmarker,
          filesetResolver,
          modelPath,
          "CPU"
        );
      }
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/** Fire-and-forget warmup so the first camera click is near-instant. */
export function warmupLandmarker(): void {
  if (typeof window === "undefined") return;
  if (landmarkerInstance || initPromise) return;

  const run = () => {
    void initializeLandmarker().catch(() => {
      /* warmup is best-effort */
    });
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(run, {
      timeout: 2500,
    });
  } else {
    setTimeout(run, 400);
  }
}

/**
 * Detect face landmarks from a live <video> element.
 * Returns null if no face is found or the video is not ready.
 */
export function detectLandmarks(
  video: HTMLVideoElement
): LandmarkDetectionResult | null {
  if (!landmarkerInstance) return null;
  if (video.readyState < 2 || video.videoWidth === 0) return null;

  let ts = performance.now();
  if (ts <= lastTimestamp) ts = lastTimestamp + 1;
  lastTimestamp = ts;

  try {
    const result = landmarkerInstance.detectForVideo(video, ts);
    if (!result?.faceLandmarks?.length) return null;

    return {
      landmarks: result.faceLandmarks[0] as NormalizedLandmark[],
      blendshapes: result.faceBlendshapes?.[0]?.categories || [],
      timestamp: ts,
    };
  } catch (err) {
    console.error("[MediaPipe] Detection error:", err);
    return null;
  }
}

/**
 * Fully tear down the landmarker (rare — e.g. leaving the app).
 * Camera stop should NOT call this; keep the model warm for reuse.
 */
export function dispose(): void {
  if (landmarkerInstance) {
    try {
      landmarkerInstance.close();
    } catch (_) {
      /* swallow */
    }
    landmarkerInstance = null;
  }
  initPromise = null;
  lastTimestamp = -1;
}
