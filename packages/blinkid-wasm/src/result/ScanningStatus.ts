/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the different states of a scanning process.
 *
 * ScanningStatus defines the possible statuses that can occur during the
 * scanning operation, specifically for managing the progress of scanning sides
 * and the entire document.
 */
export type ScanningStatus =
  | "scanning-side-in-progress"
  | "scanning-barcode-in-progress"
  | "side-scanned"
  | "document-scanned"
  | "cancelled";
