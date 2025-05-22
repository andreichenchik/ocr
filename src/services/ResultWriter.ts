import path from 'path';
import { IResultWriter } from '../interfaces/IResultWriter';
import { IFileService } from '../interfaces/IFileService';
import { OcrResult, ProcessedFile } from '../models/OcrResult';

export class ResultWriter implements IResultWriter {
  constructor(private fileService: IFileService) {}
  
  async writeIndividualResult(result: ProcessedFile, outputDir: string): Promise<void> {
    const fileName = this.fileService.getFileName(result.filePath);
    const baseFileName = fileName.replace(/\.pdf$/i, '');
    const outputFileName = `ocr_${baseFileName}.json`;
    const outputPath = path.join(outputDir, outputFileName);
    
    await this.fileService.ensureDirectory(outputDir);
    
    const jsonData = JSON.stringify(result.result, null, 2);
    await this.fileService.writeFile(outputPath, jsonData);
    
    console.log(`Individual result saved to ${outputPath}`);
  }
  
  async writeCombinedResult(result: OcrResult, fileName: string, outputDir: string): Promise<void> {
    const outputPath = path.join(outputDir, fileName);
    
    await this.fileService.ensureDirectory(outputDir);
    
    const jsonData = JSON.stringify(result, null, 2);
    await this.fileService.writeFile(outputPath, jsonData);
    
    console.log(`Combined result saved to ${outputPath}`);
  }
}