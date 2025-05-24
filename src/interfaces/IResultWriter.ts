import { OcrResult, ProcessedFile } from '../models/OcrResult';

export interface IResultWriter {
  /**
   * Write individual result to file
   * @param result Processed file result
   * @param outputDir Output directory
   * @returns Promise that resolves when write is complete
   */
  writeIndividualResult(result: ProcessedFile, outputDir: string): Promise<void>;
  
  /**
   * Write combined result to file
   * @param result Combined OCR result
   * @param fileName Output file name
   * @param outputDir Output directory
   * @returns Promise that resolves when write is complete
   */
  writeCombinedResult(result: OcrResult, fileName: string, outputDir: string): Promise<void>;
}