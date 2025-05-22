import { OcrResult } from '../models/OcrResult';

export interface IResultAggregator {
  /**
   * Combine multiple OCR results into a single result
   * @param results Array of OCR results
   * @returns Combined OCR result
   */
  combineResults(results: OcrResult[]): OcrResult;
}