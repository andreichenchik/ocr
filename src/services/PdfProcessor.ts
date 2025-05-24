import { IPdfProcessor } from '../interfaces/IPdfProcessor';
import { IOcrProvider } from '../interfaces/IOcrProvider';
import { IFileService } from '../interfaces/IFileService';
import { ProcessedFile } from '../models/OcrResult';

export class PdfProcessor implements IPdfProcessor {
  constructor(
    private ocrProvider: IOcrProvider,
    private fileService: IFileService
  ) {}
  
  async processFiles(filePaths: string[]): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];
    
    for (const filePath of filePaths) {
      console.log(`Processing ${filePath}...`);
      const result = await this.processFile(filePath);
      results.push(result);
    }
    
    return results;
  }
  
  async processFile(filePath: string): Promise<ProcessedFile> {
    const timestamp = new Date();
    
    try {
      const fileContent = await this.fileService.readFile(filePath);
      const fileName = this.fileService.getFileName(filePath);
      const result = await this.ocrProvider.processFile(fileContent, fileName);
      
      return {
        filePath,
        result,
        timestamp
      };
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      return {
        filePath,
        result: { pages: [] },
        timestamp,
        error: error as Error
      };
    }
  }
}