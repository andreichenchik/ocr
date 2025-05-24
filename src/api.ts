// Export interfaces
export * from './interfaces/IConfiguration';
export * from './interfaces/IFileService';
export * from './interfaces/IOcrProvider';
export * from './interfaces/IPatternMatcher';
export * from './interfaces/IPdfProcessor';
export * from './interfaces/IResultAggregator';
export * from './interfaces/IResultWriter';

// Export models
export * from './models/OcrResult';

// Export services
export { Configuration } from './config/Configuration';
export { FileService } from './services/FileService';
export { MistralOcrProvider } from './services/MistralOcrProvider';
export { PatternMatcher } from './services/PatternMatcher';
export { PdfProcessor } from './services/PdfProcessor';
export { ResultAggregator } from './services/ResultAggregator';
export { ResultWriter } from './services/ResultWriter';
export { OcrOrchestrator, OcrOrchestratorOptions } from './services/OcrOrchestrator';

// Export CLI
export { CliHandler, CliOptions } from './cli/CliHandler';

// Export container
export { Container } from './container/Container';

// Export a convenience function for programmatic use
import { Container } from './container/Container';

export async function processOcr(
  pdfFiles: string[],
  outputDir: string = process.cwd(),
  combinedOutputFile: string = 'result.json',
  singleFileMode: boolean = false
): Promise<void> {
  const container = new Container();
  const orchestrator = container.getOcrOrchestrator();
  
  await orchestrator.processFiles(pdfFiles, {
    outputDir,
    combinedOutputFile,
    singleFileMode
  });
}