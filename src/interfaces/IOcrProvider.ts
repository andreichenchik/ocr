import { OcrResult } from '../models/OcrResult';

export interface IOcrProvider {
  /**
   * Process a PDF file and extract text using OCR
   * @param fileContent Buffer containing PDF file data
   * @param fileName Name of the PDF file
   * @returns Promise with OCR results
   */
  processFile(fileContent: Buffer, fileName: string): Promise<OcrResult>;
  
  /**
   * Get the provider name
   */
  getProviderName(): string;
}