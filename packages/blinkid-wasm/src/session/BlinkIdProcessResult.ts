/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { InputImageAnalysisResult } from "../result";
import { ResultCompleteness } from "../result";

/**
 * Represents the overall result of the document processing pipeline.
 *
 * This structure combines the results of input image analysis and processing,
 * including detection, document image quality analysis, along with information
 * about the completeness of the extraction process for the document.
 */
export type BlinkIdProcessResult = {
  /** Result of the processing and analysis of the input image. */
  inputImageAnalysisResult: InputImageAnalysisResult;
  /** Completeness of the extraction process. */
  resultCompleteness: ResultCompleteness;
};
