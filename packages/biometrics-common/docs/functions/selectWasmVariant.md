[**@microblink/biometrics-common**](../README.md)

***

[@microblink/biometrics-common](../README.md) / selectWasmVariant

# Function: selectWasmVariant()

> **selectWasmVariant**(`capabilities`): `"simd"` \| `"simd-threads"` \| `"simd-relaxed"` \| `"simd-relaxed-threads"` \| `undefined`

Selects the fastest supported runtime, or no runtime when SIMD is unavailable.

## Parameters

### capabilities

[`WasmCapabilities`](../type-aliases/WasmCapabilities.md)

## Returns

`"simd"` \| `"simd-threads"` \| `"simd-relaxed"` \| `"simd-relaxed-threads"` \| `undefined`
