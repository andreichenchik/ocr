import { OcrOrchestrator, OcrOrchestratorOptions } from '../../src/services/OcrOrchestrator';
import { IPdfProcessor } from '../../src/interfaces/IPdfProcessor';
import { IResultAggregator } from '../../src/interfaces/IResultAggregator';
import { IResultWriter } from '../../src/interfaces/IResultWriter';
import { ProcessedFile, OcrResult } from '../../src/models/OcrResult';

// Mock implementations
class MockPdfProcessor implements IPdfProcessor {
  processFile = jest.fn();
  processFiles = jest.fn();
}

class MockResultAggregator implements IResultAggregator {
  combineResults = jest.fn();
}

class MockResultWriter implements IResultWriter {
  writeIndividualResult = jest.fn();
  writeCombinedResult = jest.fn();
}

describe('OcrOrchestrator', () => {
  let orchestrator: OcrOrchestrator;
  let mockPdfProcessor: MockPdfProcessor;
  let mockResultAggregator: MockResultAggregator;
  let mockResultWriter: MockResultWriter;
  let consoleLogSpy: jest.SpyInstance;
  
  beforeEach(() => {
    mockPdfProcessor = new MockPdfProcessor();
    mockResultAggregator = new MockResultAggregator();
    mockResultWriter = new MockResultWriter();
    orchestrator = new OcrOrchestrator(
      mockPdfProcessor,
      mockResultAggregator,
      mockResultWriter
    );
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });
  
  describe('processFiles', () => {
    const mockProcessedFiles: ProcessedFile[] = [
      {
        filePath: '/path/to/file1.pdf',
        result: { pages: [{ index: 0, text: 'Page 1' }] },
        timestamp: new Date()
      },
      {
        filePath: '/path/to/file2.pdf',
        result: { pages: [{ index: 0, text: 'Page 2' }] },
        timestamp: new Date()
      }
    ];
    
    const mockCombinedResult: OcrResult = {
      pages: [
        { index: 0, text: 'Page 1' },
        { index: 1, text: 'Page 2' }
      ]
    };
    
    beforeEach(() => {
      mockPdfProcessor.processFiles.mockResolvedValue(mockProcessedFiles);
      mockResultAggregator.combineResults.mockReturnValue(mockCombinedResult);
    });
    
    test('should process multiple files successfully', async () => {
      const filePaths = ['/path/to/file1.pdf', '/path/to/file2.pdf'];
      
      await orchestrator.processFiles(filePaths);
      
      expect(mockPdfProcessor.processFiles).toHaveBeenCalledWith(filePaths);
      expect(mockResultWriter.writeIndividualResult).toHaveBeenCalledTimes(2);
      expect(mockResultWriter.writeIndividualResult).toHaveBeenCalledWith(
        mockProcessedFiles[0],
        process.cwd()
      );
      expect(mockResultWriter.writeIndividualResult).toHaveBeenCalledWith(
        mockProcessedFiles[1],
        process.cwd()
      );
      expect(mockResultAggregator.combineResults).toHaveBeenCalledWith([
        mockProcessedFiles[0].result,
        mockProcessedFiles[1].result
      ]);
      expect(mockResultWriter.writeCombinedResult).toHaveBeenCalledWith(
        mockCombinedResult,
        'result.json',
        process.cwd()
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('All files processed successfully!');
    });
    
    test('should process single file without combined result', async () => {
      const singleFile: ProcessedFile[] = [mockProcessedFiles[0]];
      mockPdfProcessor.processFiles.mockResolvedValue(singleFile);
      
      await orchestrator.processFiles(['/path/to/file1.pdf']);
      
      expect(mockResultWriter.writeIndividualResult).toHaveBeenCalledTimes(1);
      expect(mockResultAggregator.combineResults).not.toHaveBeenCalled();
      expect(mockResultWriter.writeCombinedResult).not.toHaveBeenCalled();
    });
    
    test('should handle custom options', async () => {
      const options: OcrOrchestratorOptions = {
        outputDir: '/custom/output',
        combinedOutputFile: 'custom-result.json',
        singleFileMode: false
      };
      
      await orchestrator.processFiles(['/path/to/file1.pdf', '/path/to/file2.pdf'], options);
      
      expect(mockResultWriter.writeIndividualResult).toHaveBeenCalledWith(
        mockProcessedFiles[0],
        '/custom/output'
      );
      expect(mockResultWriter.writeCombinedResult).toHaveBeenCalledWith(
        mockCombinedResult,
        'custom-result.json',
        '/custom/output'
      );
    });
    
    test('should process only first file in single file mode', async () => {
      const options: OcrOrchestratorOptions = {
        singleFileMode: true
      };
      const singleFile: ProcessedFile[] = [mockProcessedFiles[0]];
      mockPdfProcessor.processFiles.mockResolvedValue(singleFile);
      
      await orchestrator.processFiles(['/path/to/file1.pdf', '/path/to/file2.pdf'], options);
      
      expect(mockPdfProcessor.processFiles).toHaveBeenCalledWith(['/path/to/file1.pdf']);
    });
    
    test('should throw error when no files provided', async () => {
      await expect(orchestrator.processFiles([])).rejects.toThrow(
        'No PDF files provided for processing'
      );
    });
    
    test('should filter out failed results', async () => {
      const mixedResults: ProcessedFile[] = [
        mockProcessedFiles[0],
        {
          filePath: '/path/to/failed.pdf',
          result: { pages: [] },
          timestamp: new Date(),
          error: new Error('Processing failed')
        },
        mockProcessedFiles[1]
      ];
      mockPdfProcessor.processFiles.mockResolvedValue(mixedResults);
      
      await orchestrator.processFiles([
        '/path/to/file1.pdf',
        '/path/to/failed.pdf',
        '/path/to/file2.pdf'
      ]);
      
      expect(mockResultWriter.writeIndividualResult).toHaveBeenCalledTimes(2);
      expect(mockResultWriter.writeIndividualResult).not.toHaveBeenCalledWith(
        mixedResults[1],
        expect.any(String)
      );
    });
    
    test('should throw error when all files fail to process', async () => {
      const failedResults: ProcessedFile[] = [
        {
          filePath: '/path/to/failed1.pdf',
          result: { pages: [] },
          timestamp: new Date(),
          error: new Error('Processing failed')
        },
        {
          filePath: '/path/to/failed2.pdf',
          result: { pages: [] },
          timestamp: new Date(),
          error: new Error('Processing failed')
        }
      ];
      mockPdfProcessor.processFiles.mockResolvedValue(failedResults);
      
      await expect(orchestrator.processFiles([
        '/path/to/failed1.pdf',
        '/path/to/failed2.pdf'
      ])).rejects.toThrow('All files failed to process');
    });
    
    test('should handle processing error', async () => {
      mockPdfProcessor.processFiles.mockRejectedValue(new Error('Processing error'));
      
      await expect(orchestrator.processFiles(['/path/to/file.pdf'])).rejects.toThrow(
        'Processing error'
      );
    });
    
    test('should handle write error for individual result', async () => {
      mockResultWriter.writeIndividualResult.mockRejectedValue(new Error('Write error'));
      
      await expect(orchestrator.processFiles(['/path/to/file.pdf'])).rejects.toThrow(
        'Write error'
      );
    });
    
    test('should handle write error for combined result', async () => {
      mockResultWriter.writeCombinedResult.mockRejectedValue(new Error('Combined write error'));
      
      await expect(orchestrator.processFiles(['/path/to/file1.pdf', '/path/to/file2.pdf']))
        .rejects.toThrow('Combined write error');
    });
  });
});