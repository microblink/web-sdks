/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

declare const sizeManifest: {
  wasm: {
    simd: {
      lightweight: number;
      full: number;
    };
    "simd-threads": {
      lightweight: number;
      full: number;
    };
    "simd-relaxed": {
      lightweight: number;
      full: number;
    };
    "simd-relaxed-threads": {
      lightweight: number;
      full: number;
    };
  };
  data: {
    simd: {
      lightweight: number;
      full: number;
    };
    "simd-threads": {
      lightweight: number;
      full: number;
    };
    "simd-relaxed": {
      lightweight: number;
      full: number;
    };
    "simd-relaxed-threads": {
      lightweight: number;
      full: number;
    };
  };
};

export default sizeManifest;
