import { ProcessedFile } from '../models/OcrResult';

export interface IPdfProcessor {
  /**
   * Process multiple PDF files
   * @param filePaths Array of file paths to process
   * @returns Promise with array of processed file results
   */
  processFiles(filePaths: string[]): Promise<ProcessedFile[]>;
  
  /**
   * Process a single PDF file
   * @param filePath Path to the PDF file
   * @returns Promise with processed file result
   */
  processFile(filePath: string): Promise<ProcessedFile>;
}