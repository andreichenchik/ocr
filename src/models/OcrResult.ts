export interface OcrPage {
  index: number;
  text?: string;
  [key: string]: any;
}

export interface OcrResult {
  pages: OcrPage[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface ProcessedFile {
  filePath: string;
  result: OcrResult;
  timestamp: Date;
  error?: Error;
}