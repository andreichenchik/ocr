import { IPdfProcessor } from '../interfaces/IPdfProcessor';
import { IResultAggregator } from '../interfaces/IResultAggregator';
import { IResultWriter } from '../interfaces/IResultWriter';

export interface OcrOrchestratorOptions {
  outputDir?: string;
  combinedOutputFile?: string;
  singleFileMode?: boolean;
}

export class OcrOrchestrator {
  constructor(
    private pdfProcessor: IPdfProcessor,
    private resultAggregator: IResultAggregator,
    private resultWriter: IResultWriter
  ) {}
  
  async processFiles(
    filePaths: string[],
    options: OcrOrchestratorOptions = {}
  ): Promise<void> {
    const {
      outputDir = process.cwd(),
      combinedOutputFile = 'result.json',
      singleFileMode = false
    } = options;
    
    if (filePaths.length === 0) {
      throw new Error('No PDF files provided for processing');
    }
    
    // Process files based on mode
    const filesToProcess = singleFileMode ? [filePaths[0]] : filePaths;
    
    // Process all PDF files
    const processedFiles = await this.pdfProcessor.processFiles(filesToProcess);
    
    // Filter out failed results
    const successfulResults = processedFiles.filter(pf => !pf.error);
    
    if (successfulResults.length === 0) {
      throw new Error('All files failed to process');
    }
    
    // Write individual results
    for (const processedFile of successfulResults) {
      await this.resultWriter.writeIndividualResult(processedFile, outputDir);
    }
    
    // Write combined result if processing multiple files
    if (successfulResults.length > 1) {
      const ocrResults = successfulResults.map(pf => pf.result);
      const combinedResult = this.resultAggregator.combineResults(ocrResults);
      await this.resultWriter.writeCombinedResult(combinedResult, combinedOutputFile, outputDir);
    }
    
    console.log('All files processed successfully!');
  }
}