/**
 * useFaceEmotion.ts
 * Central hook for face emotion detection using MediaPipe.
 * Camera opens in parallel with model init so preview appears quickly.
 */

import { useState, useRef, useCallback } from "react";
import { initializeLandmarker, detectLandmarks } from "./mediapipeService";
import { extractFeatures } from "./emotionFeatureExtractor";
import { calculateRawScore, applyTemporalSmoothingStep, resetScoringState } from "./emotionScoringEngine";
import { EmotionSmoothingEngine } from "./emotionSmoothingEngine";
import { getMoodCategory } from "@/lib/utils/moodMapper";

export function useFaceEmotion() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const modelReadyRef = useRef(false);

  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveScore, setLiveScore] = useState<number>(50);
  const [liveMood, setLiveMood] = useState<string>("😊 Content");
  const [isStable, setIsStableState] = useState(false);
  const isStableRef = useRef(false);

  const setIsStable = useCallback((val: boolean) => {
    setIsStableState(val);
    isStableRef.current = val;
  }, []);

  // Window 12 (~0.6s), lock ~1.5s — faster confirm without feeling jumpy
  const smoothingEngineRef = useRef(new EmotionSmoothingEngine(12, 1500));

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Keep MediaPipe warm — do not dispose() here

    smoothingEngineRef.current.reset();
    modelReadyRef.current = false;
    setIsInitializing(false);
    setIsStable(false);
    setError(null);
  }, [setIsStable]);

  const processFrame = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (modelReadyRef.current) {
        const result = detectLandmarks(videoRef.current);
        if (result) {
          const rawFeatures = extractFeatures(result.landmarks, result.blendshapes);
          const rawScore = calculateRawScore(rawFeatures);
          const ewmaScore = applyTemporalSmoothingStep(rawScore);
          const { smoothedScore, isStable: stableNow } = smoothingEngineRef.current.processScore(
            ewmaScore,
            result.timestamp
          );

          if (!isStableRef.current) {
            const finalScore = Math.max(0, Math.min(100, Math.round(smoothedScore)));
            setLiveScore(finalScore);
            setLiveMood(getMoodCategory(finalScore));

            if (stableNow) {
              setIsStable(true);
            }
          }
        }
      }
    } catch (e) {
      console.error("Frame processing error:", e);
    }

    // ~20 FPS
    await new Promise((r) => setTimeout(r, 50));
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [setIsStable]);

  const attachStreamAndPlay = useCallback(
    async (stream: MediaStream) => {
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        setIsInitializing(false);
        return;
      }

      video.srcObject = stream;

      const play = async () => {
        try {
          await video.play();
          // Preview is live — hide "Starting camera..." even if model still loads
          setIsInitializing(false);
          if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
          }
        } catch (e) {
          console.error("Video play error:", e);
          setError("Failed to play video");
          setIsInitializing(false);
        }
      };

      if (video.readyState >= 2) {
        await play();
      } else {
        await new Promise<void>((resolve) => {
          const onReady = () => {
            video.removeEventListener("loadeddata", onReady);
            resolve();
          };
          video.addEventListener("loadeddata", onReady);
          // Safety: don't hang forever if metadata never fires
          setTimeout(resolve, 2500);
        });
        await play();
      }
    },
    [processFrame]
  );

  const waitForVideoEl = useCallback(async (timeoutMs = 2000) => {
    const start = performance.now();
    while (!videoRef.current && performance.now() - start < timeoutMs) {
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    }
    return !!videoRef.current;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsInitializing(true);
      setIsStable(false);
      setLiveScore(50);
      setLiveMood("😊 Content");
      modelReadyRef.current = false;

      smoothingEngineRef.current.reset();
      resetScoringState();

      // Ensure dialog <video> is mounted before attaching the stream
      const hasVideo = await waitForVideoEl();
      if (!hasVideo) {
        throw new Error("Camera preview failed to mount. Please try again.");
      }

      // Open camera + load model in parallel (biggest startup win)
      const cameraPromise = navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 480 },
          height: { ideal: 360 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      });

      const modelPromise = initializeLandmarker()
        .then(() => {
          modelReadyRef.current = true;
        })
        .catch((err) => {
          console.error("MediaPipe init error:", err);
          throw new Error("Face model failed to load. Please try again.");
        });

      const stream = await cameraPromise;
      await attachStreamAndPlay(stream);

      // Model may still be finishing — detection starts once ready
      await modelPromise;
      modelReadyRef.current = true;
    } catch (err: any) {
      console.error("Camera start error:", err);
      setError(err?.message || "Failed to start camera");
      setIsInitializing(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }, [attachStreamAndPlay, setIsStable, waitForVideoEl]);

  const retry = useCallback(() => {
    stopCamera();
    // Small yield so tracks fully release before reopen
    setTimeout(() => {
      void startCamera();
    }, 150);
  }, [startCamera, stopCamera]);

  return {
    videoRef,
    isInitializing,
    error,
    liveScore,
    liveMood,
    isStable,
    startCamera,
    stopCamera,
    retry,
  };
}
