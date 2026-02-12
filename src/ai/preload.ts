let prefetching = false;

function idle(callback: () => void): void {
  if (typeof globalThis === 'undefined') return;
  const root = globalThis as typeof globalThis & {
    requestIdleCallback?: (cb: () => void) => void;
  };
  if (root.requestIdleCallback) {
    root.requestIdleCallback(callback);
    return;
  }
  setTimeout(callback, 200);
}

export function prefetchVisionAssets(baseUrl: string): void {
  if (prefetching || typeof globalThis === 'undefined') return;
  prefetching = true;

  const wasmBase = `${baseUrl}mediapipe/wasm`;
  const targets = [
    `${wasmBase}/vision_wasm_internal.js`,
    `${wasmBase}/vision_wasm_internal.wasm`,
    `${wasmBase}/vision_wasm_nosimd_internal.js`,
    `${wasmBase}/vision_wasm_nosimd_internal.wasm`,
    `${baseUrl}face_landmarker.task`
  ];

  idle(() => {
    targets.forEach((url) => {
      fetch(url, { cache: 'force-cache' }).catch(() => {});
    });
  });
}
