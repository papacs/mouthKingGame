import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { MAX_PLAYERS } from '../config/gameConfig';

export interface DetectedMouth {
  x: number;
  y: number;
  openRatio: number;
}

export async function createFaceTracker(modelPath: string) {
  const resolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
  );

  const landmarker = await FaceLandmarker.createFromOptions(resolver, {
    baseOptions: { modelAssetPath: modelPath, delegate: 'GPU' },
    runningMode: 'VIDEO',
    numFaces: MAX_PLAYERS,
    outputFaceBlendshapes: false
  });

  return {
    detect(video: HTMLVideoElement): DetectedMouth[] {
      const result = landmarker.detectForVideo(video, performance.now());
      const faces = result.faceLandmarks ?? [];
      return faces.slice(0, MAX_PLAYERS).map((landmarks) => {
        const upper = landmarks[13];
        const lower = landmarks[14];
        const forehead = landmarks[10];
        const chin = landmarks[152];

        const mouthHeight = Math.hypot(upper.x - lower.x, upper.y - lower.y);
        const faceHeight = Math.hypot(forehead.x - chin.x, forehead.y - chin.y);

        return {
          x: (upper.x + lower.x) / 2,
          y: (upper.y + lower.y) / 2,
          openRatio: mouthHeight / faceHeight
        };
      });
    }
  };
}
