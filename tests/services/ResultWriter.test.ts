import { ResultWriter } from '../../src/services/ResultWriter';
import { IFileService } from '../../src/interfaces/IFileService';
import { ProcessedFile, OcrResult } from '../../src/models/OcrResult';
import path from 'path';

// Mock FileService implementation
class MockFileService implements IFileService {
  readFile = jest.fn();
  writeFile = jest.fn();
  exists = jest.fn();
  ensureDirectory = jest.fn();
  getFileName = jest.fn();
  getDirectory = jest.fn();
}

describe('ResultWriter', () => {
  let resultWriter: ResultWriter;
  let mockFileService: MockFileService;
  let consoleLogSpy: jest.SpyInstance;
  
  beforeEach(() => {
    mockFileService = new MockFileService();
    resultWriter = new ResultWriter(mockFileService);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
  });
  
  describe('writeIndividualResult', () => {
    const mockProcessedFile: ProcessedFile = {
      filePath: '/path/to/document.pdf',
      result: {
        pages: [
          { index: 0, text: 'Page 1 content' },
          { index: 1, text: 'Page 2 content' }
        ]
      },
      timestamp: new Date()
    };
    
    test('should write individual result with correct filename', async () => {
      mockFileService.getFileName.mockReturnValue('document.pdf');
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeIndividualResult(mockProcessedFile, '/output/dir');
      
      expect(mockFileService.getFileName).toHaveBeenCalledWith('/path/to/document.pdf');
      expect(mockFileService.ensureDirectory).toHaveBeenCalledWith('/output/dir');
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        path.join('/output/dir', 'ocr_document.json'),
        JSON.stringify(mockProcessedFile.result, null, 2)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Individual result saved to ' + path.join('/output/dir', 'ocr_document.json')
      );
    });
    
    test('should handle case-insensitive PDF extension', async () => {
      mockFileService.getFileName.mockReturnValue('Document.PDF');
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeIndividualResult(mockProcessedFile, '/output');
      
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        path.join('/output', 'ocr_Document.json'),
        expect.any(String)
      );
    });
    
    test('should handle files with multiple dots', async () => {
      mockFileService.getFileName.mockReturnValue('my.document.v2.pdf');
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeIndividualResult(mockProcessedFile, '/output');
      
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        path.join('/output', 'ocr_my.document.v2.json'),
        expect.any(String)
      );
    });
    
    test('should handle write errors', async () => {
      mockFileService.getFileName.mockReturnValue('document.pdf');
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockRejectedValue(new Error('Write failed'));
      
      await expect(resultWriter.writeIndividualResult(mockProcessedFile, '/output'))
        .rejects.toThrow('Write failed');
    });
    
    test('should handle directory creation errors', async () => {
      mockFileService.getFileName.mockReturnValue('document.pdf');
      mockFileService.ensureDirectory.mockRejectedValue(new Error('Cannot create directory'));
      
      await expect(resultWriter.writeIndividualResult(mockProcessedFile, '/output'))
        .rejects.toThrow('Cannot create directory');
    });
    
    test('should format JSON with proper indentation', async () => {
      mockFileService.getFileName.mockReturnValue('document.pdf');
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeIndividualResult(mockProcessedFile, '/output');
      
      const expectedJson = JSON.stringify(mockProcessedFile.result, null, 2);
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expectedJson
      );
    });
  });
  
  describe('writeCombinedResult', () => {
    const mockOcrResult: OcrResult = {
      pages: [
        { index: 0, text: 'Combined page 1' },
        { index: 1, text: 'Combined page 2' },
        { index: 2, text: 'Combined page 3' }
      ],
      metadata: {
        totalPages: 3,
        processedAt: new Date().toISOString()
      }
    };
    
    test('should write combined result to specified file', async () => {
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeCombinedResult(mockOcrResult, 'combined-result.json', '/output/dir');
      
      expect(mockFileService.ensureDirectory).toHaveBeenCalledWith('/output/dir');
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        path.join('/output/dir', 'combined-result.json'),
        JSON.stringify(mockOcrResult, null, 2)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Combined result saved to ' + path.join('/output/dir', 'combined-result.json')
      );
    });
    
    test('should handle custom output directories', async () => {
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeCombinedResult(mockOcrResult, 'output.json', '/custom/path');
      
      expect(mockFileService.ensureDirectory).toHaveBeenCalledWith('/custom/path');
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        path.join('/custom/path', 'output.json'),
        expect.any(String)
      );
    });
    
    test('should handle write errors', async () => {
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockRejectedValue(new Error('Disk full'));
      
      await expect(resultWriter.writeCombinedResult(mockOcrResult, 'result.json', '/output'))
        .rejects.toThrow('Disk full');
    });
    
    test('should handle directory creation errors', async () => {
      mockFileService.ensureDirectory.mockRejectedValue(new Error('Permission denied'));
      
      await expect(resultWriter.writeCombinedResult(mockOcrResult, 'result.json', '/output'))
        .rejects.toThrow('Permission denied');
    });
    
    test('should format JSON with proper indentation', async () => {
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeCombinedResult(mockOcrResult, 'result.json', '/output');
      
      const expectedJson = JSON.stringify(mockOcrResult, null, 2);
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expectedJson
      );
    });
    
    test('should handle empty result', async () => {
      const emptyResult: OcrResult = { pages: [] };
      mockFileService.ensureDirectory.mockResolvedValue(undefined);
      mockFileService.writeFile.mockResolvedValue(undefined);
      
      await resultWriter.writeCombinedResult(emptyResult, 'empty.json', '/output');
      
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        path.join('/output', 'empty.json'),
        JSON.stringify(emptyResult, null, 2)
      );
    });
  });
});