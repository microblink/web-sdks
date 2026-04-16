# @microblink/blinkid-verify-wasm

## 3.20.1

### Patch Changes

- Fixed a bug where movement instructions for the second page of some passports were not returned correctly.
- Added new settings to `ScanningSettings`:
  - `scanPassportDataPageOnly` - when enabled, only the passport data page (containing `MRZ`) is scanned; when disabled, scanning of the second page is required for certain passports
  - `scanUnsupportedBack` - when enabled, the back side of documents whose back side is not supported will also be scanned

## 3.20.0

- Introducing BlinkID Verify web SDK, a capturing solution for perparing the perfect frames from a camera to be sent to the BlinkID verify API
