[**@microblink/biometrics**](../README.md)

***

[@microblink/biometrics](../README.md) / WasmVariant

# Type Alias: WasmVariant

> **WasmVariant** = *typeof* `wasmVariants`\[`number`\]

Native WebAssembly runtime variants. `simd*` variants use fixed-width SIMD only; `simd-relaxed*` variants
additionally use relaxed SIMD instructions. `*-threads` variants use pthreads and require shared memory.
