[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / WasmVariant

# Type Alias: WasmVariant

> **WasmVariant** = `"simd"` \| `"simd-threads"` \| `"simd-relaxed"` \| `"simd-relaxed-threads"`

Native WebAssembly runtime variants shipped with Biometrics. `simd*` variants use fixed-width SIMD only;
`simd-relaxed*` variants additionally use relaxed SIMD instructions. `*-threads` variants use pthreads and require
shared memory.
