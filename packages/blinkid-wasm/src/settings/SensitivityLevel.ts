/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Represents the sensitivity levels for document quality analysis.
 *
 * This type is used to configure detection sensitivity thresholds and enable or
 * disable detection functionality. The levels range from turning detection off
 * completely to setting various levels of sensitivity (Low, Mid, High).
 */
export type SensitivityLevel = "off" | "low" | "mid" | "high";
