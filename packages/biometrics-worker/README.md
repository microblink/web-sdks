# @microblink/biometrics-worker

Internal Web Worker package used by `@microblink/biometrics-core` to run the
Biometrics WebAssembly module outside the main browser thread.

## Browser Support

This package supports image processing in these browser versions and newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 132 (desktop)
- Safari 16.4 (macOS)
- iOS Safari 16.4

This package is not intended for direct use. Use
`@microblink/biometrics-core` or `@microblink/biometrics` instead.
