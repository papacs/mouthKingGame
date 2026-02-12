let prefetching = false;

function idle(callback: () => void): void {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    (window.requestIdleCallback as (cb: () => void) => void)(callback);
    return;
  }
  window.setTimeout(callback, 200);
}

export function prefetchVisionAssets(baseUrl: string): void {
  if (prefetching || typeof window === 'undefined') return;
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
