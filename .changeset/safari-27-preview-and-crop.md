---
"@microblink/camera-manager": patch
"@microblink/blinkid": patch
---

Fixes the Safari 27 / iPadOS 27 camera preview that stays black while the camera stream still produces frames. BlinkID 8002.0.1 already avoids the template-cloned video bug, and that build still reproduces on iPadOS 27.0.1. The built-in camera UI now also plays the same stream on a second element and shows it after playback starts. Recognition continues to read the original element.

Fixes 2D frame cropping. `VideoFrameProcessor` called the five-argument `drawImage`, which scales the whole frame into the destination. Cropped extraction now uses the source rectangle, so a region such as `{x:40, y:30, width:160, height:100}` returns those source pixels. Full-frame extraction is unchanged. WebGL2 cropping was already correct.
