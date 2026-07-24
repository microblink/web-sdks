/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Describes whether VIZ extraction was available for the processed input image
 * and which extraction path was selected.
 *
 * - `"not-available"`: VIZ extraction has not been evaluated yet.
 * - `"segmentation"`: VIZ data was extracted using segmentation.
 * - `"templating"`: VIZ data was extracted using a document template.
 * - `"unsupported"`: VIZ extraction is not supported for the processed image.
 */
export type VizExtractionType =
  "not-available" | "segmentation" | "templating" | "unsupported";
