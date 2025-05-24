import { Container } from '../../src/container/Container';
import { Configuration } from '../../src/config/Configuration';
import { FileService } from '../../src/services/FileService';
import { MistralOcrProvider } from '../../src/services/MistralOcrProvider';
import { ResultAggregator } from '../../src/services/ResultAggregator';
import { PdfProcessor } from '../../src/services/PdfProcessor';
import { ResultWriter } from '../../src/services/ResultWriter';
import { PatternMatcher } from '../../src/services/PatternMatcher';
import { OcrOrchestrator } from '../../src/services/OcrOrchestrator';
import { CliHandler } from '../../src/cli/CliHandler';

// Mock all dependencies
jest.mock('../../src/config/Configuration');
jest.mock('../../src/services/FileService');
jest.mock('../../src/services/MistralOcrProvider');
jest.mock('../../src/services/ResultAggregator');
jest.mock('../../src/services/PdfProcessor');
jest.mock('../../src/services/ResultWriter');
jest.mock('../../src/services/PatternMatcher');
jest.mock('../../src/services/OcrOrchestrator');
jest.mock('../../src/cli/CliHandler');

describe('Container', () => {
  let container: Container;
  
  beforeEach(() => {
    container = new Container();
    jest.clearAllMocks();
  });
  
  describe('getConfiguration', () => {
    test('should return Configuration instance', () => {
      const configuration = container.getConfiguration();
      expect(configuration).toBeInstanceOf(Configuration);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const config1 = container.getConfiguration();
      const config2 = container.getConfiguration();
      expect(config1).toBe(config2);
    });
    
    test('should create Configuration only once', () => {
      container.getConfiguration();
      container.getConfiguration();
      container.getConfiguration();
      expect(Configuration).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('getFileService', () => {
    test('should return FileService instance', () => {
      const fileService = container.getFileService();
      expect(fileService).toBeInstanceOf(FileService);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const service1 = container.getFileService();
      const service2 = container.getFileService();
      expect(service1).toBe(service2);
    });
  });
  
  describe('getOcrProvider', () => {
    test('should return MistralOcrProvider instance', () => {
      const ocrProvider = container.getOcrProvider();
      expect(ocrProvider).toBeInstanceOf(MistralOcrProvider);
    });
    
    test('should inject Configuration dependency', () => {
      const configuration = container.getConfiguration();
      container.getOcrProvider();
      expect(MistralOcrProvider).toHaveBeenCalledWith(configuration);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const provider1 = container.getOcrProvider();
      const provider2 = container.getOcrProvider();
      expect(provider1).toBe(provider2);
    });
  });
  
  describe('getResultAggregator', () => {
    test('should return ResultAggregator instance', () => {
      const aggregator = container.getResultAggregator();
      expect(aggregator).toBeInstanceOf(ResultAggregator);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const aggregator1 = container.getResultAggregator();
      const aggregator2 = container.getResultAggregator();
      expect(aggregator1).toBe(aggregator2);
    });
  });
  
  describe('getPdfProcessor', () => {
    test('should return PdfProcessor instance', () => {
      const processor = container.getPdfProcessor();
      expect(processor).toBeInstanceOf(PdfProcessor);
    });
    
    test('should inject OcrProvider and FileService dependencies', () => {
      const ocrProvider = container.getOcrProvider();
      const fileService = container.getFileService();
      container.getPdfProcessor();
      expect(PdfProcessor).toHaveBeenCalledWith(ocrProvider, fileService);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const processor1 = container.getPdfProcessor();
      const processor2 = container.getPdfProcessor();
      expect(processor1).toBe(processor2);
    });
  });
  
  describe('getResultWriter', () => {
    test('should return ResultWriter instance', () => {
      const writer = container.getResultWriter();
      expect(writer).toBeInstanceOf(ResultWriter);
    });
    
    test('should inject FileService dependency', () => {
      const fileService = container.getFileService();
      container.getResultWriter();
      expect(ResultWriter).toHaveBeenCalledWith(fileService);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const writer1 = container.getResultWriter();
      const writer2 = container.getResultWriter();
      expect(writer1).toBe(writer2);
    });
  });
  
  describe('getPatternMatcher', () => {
    test('should return PatternMatcher instance', () => {
      const matcher = container.getPatternMatcher();
      expect(matcher).toBeInstanceOf(PatternMatcher);
    });
    
    test('should inject FileService dependency', () => {
      const fileService = container.getFileService();
      container.getPatternMatcher();
      expect(PatternMatcher).toHaveBeenCalledWith(fileService);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const matcher1 = container.getPatternMatcher();
      const matcher2 = container.getPatternMatcher();
      expect(matcher1).toBe(matcher2);
    });
  });
  
  describe('getOcrOrchestrator', () => {
    test('should return OcrOrchestrator instance', () => {
      const orchestrator = container.getOcrOrchestrator();
      expect(orchestrator).toBeInstanceOf(OcrOrchestrator);
    });
    
    test('should inject PdfProcessor, ResultAggregator, and ResultWriter dependencies', () => {
      const pdfProcessor = container.getPdfProcessor();
      const resultAggregator = container.getResultAggregator();
      const resultWriter = container.getResultWriter();
      container.getOcrOrchestrator();
      expect(OcrOrchestrator).toHaveBeenCalledWith(
        pdfProcessor,
        resultAggregator,
        resultWriter
      );
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const orchestrator1 = container.getOcrOrchestrator();
      const orchestrator2 = container.getOcrOrchestrator();
      expect(orchestrator1).toBe(orchestrator2);
    });
  });
  
  describe('getCliHandler', () => {
    test('should return CliHandler instance', () => {
      const cliHandler = container.getCliHandler();
      expect(cliHandler).toBeInstanceOf(CliHandler);
    });
    
    test('should return same instance on multiple calls (singleton)', () => {
      const handler1 = container.getCliHandler();
      const handler2 = container.getCliHandler();
      expect(handler1).toBe(handler2);
    });
  });
  
  describe('dependency graph', () => {
    test('should share FileService instance across dependent services', () => {
      // Get services that depend on FileService
      container.getPdfProcessor();
      container.getResultWriter();
      container.getPatternMatcher();
      
      // FileService should be created only once
      expect(FileService).toHaveBeenCalledTimes(1);
    });
    
    test('should share Configuration instance across dependent services', () => {
      // Get services that depend on Configuration
      container.getOcrProvider();
      
      // Configuration should be created only once
      expect(Configuration).toHaveBeenCalledTimes(1);
    });
    
    test('should create complete dependency graph correctly', () => {
      // Get the top-level orchestrator which depends on many services
      const orchestrator = container.getOcrOrchestrator();
      
      // Verify all dependencies were created
      expect(Configuration).toHaveBeenCalled();
      expect(FileService).toHaveBeenCalled();
      expect(MistralOcrProvider).toHaveBeenCalled();
      expect(PdfProcessor).toHaveBeenCalled();
      expect(ResultAggregator).toHaveBeenCalled();
      expect(ResultWriter).toHaveBeenCalled();
      expect(OcrOrchestrator).toHaveBeenCalled();
      
      expect(orchestrator).toBeInstanceOf(OcrOrchestrator);
    });
  });
  
  describe('multiple container instances', () => {
    test('should have independent singleton instances', () => {
      const container1 = new Container();
      const container2 = new Container();
      
      const config1 = container1.getConfiguration();
      const config2 = container2.getConfiguration();
      
      // Different container instances should have different singletons
      expect(config1).not.toBe(config2);
    });
  });
});