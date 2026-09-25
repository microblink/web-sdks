/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

declare const sizeManifest: {
  wasm: {
    simd: number;
    "simd-threads": number;
    "simd-relaxed": number;
    "simd-relaxed-threads": number;
  };
  data: {
    simd: number;
    "simd-threads": number;
    "simd-relaxed": number;
    "simd-relaxed-threads": number;
  };
};

export default sizeManifest;
