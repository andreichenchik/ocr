import { IConfiguration } from '../interfaces/IConfiguration';
import { IFileService } from '../interfaces/IFileService';
import { IOcrProvider } from '../interfaces/IOcrProvider';
import { IResultAggregator } from '../interfaces/IResultAggregator';
import { IPdfProcessor } from '../interfaces/IPdfProcessor';
import { IResultWriter } from '../interfaces/IResultWriter';
import { IPatternMatcher } from '../interfaces/IPatternMatcher';

import { Configuration } from '../config/Configuration';
import { FileService } from '../services/FileService';
import { MistralOcrProvider } from '../services/MistralOcrProvider';
import { ResultAggregator } from '../services/ResultAggregator';
import { PdfProcessor } from '../services/PdfProcessor';
import { ResultWriter } from '../services/ResultWriter';
import { PatternMatcher } from '../services/PatternMatcher';
import { OcrOrchestrator } from '../services/OcrOrchestrator';
import { CliHandler } from '../cli/CliHandler';

export class Container {
  private instances = new Map<string, any>();
  
  // Configuration
  getConfiguration(): IConfiguration {
    return this.getSingleton('configuration', () => new Configuration());
  }
  
  // Services
  getFileService(): IFileService {
    return this.getSingleton('fileService', () => new FileService());
  }
  
  getOcrProvider(): IOcrProvider {
    return this.getSingleton('ocrProvider', () => 
      new MistralOcrProvider(this.getConfiguration())
    );
  }
  
  getResultAggregator(): IResultAggregator {
    return this.getSingleton('resultAggregator', () => new ResultAggregator());
  }
  
  getPdfProcessor(): IPdfProcessor {
    return this.getSingleton('pdfProcessor', () => 
      new PdfProcessor(
        this.getOcrProvider(),
        this.getFileService()
      )
    );
  }
  
  getResultWriter(): IResultWriter {
    return this.getSingleton('resultWriter', () => 
      new ResultWriter(this.getFileService())
    );
  }
  
  getPatternMatcher(): IPatternMatcher {
    return this.getSingleton('patternMatcher', () => 
      new PatternMatcher(this.getFileService())
    );
  }
  
  getOcrOrchestrator(): OcrOrchestrator {
    return this.getSingleton('ocrOrchestrator', () => 
      new OcrOrchestrator(
        this.getPdfProcessor(),
        this.getResultAggregator(),
        this.getResultWriter()
      )
    );
  }
  
  getCliHandler(): CliHandler {
    return this.getSingleton('cliHandler', () => new CliHandler());
  }
  
  private getSingleton<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key);
  }
}