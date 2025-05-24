import { PdfProcessor } from '../../src/services/PdfProcessor';
import { IOcrProvider } from '../../src/interfaces/IOcrProvider';
import { IFileService } from '../../src/interfaces/IFileService';
import { OcrResult } from '../../src/models/OcrResult';

// Mock implementations
class MockOcrProvider implements IOcrProvider {
  async processFile(fileContent: Buffer, fileName: string): Promise<OcrResult> {
    return {
      pages: [{ index: 0, text: `Processed ${fileName}` }]
    };
  }
  
  getProviderName(): string {
    return 'Mock OCR Provider';
  }
}

class MockFileService implements IFileService {
  async readFile(filePath: string): Promise<Buffer> {
    return Buffer.from(`Content of ${filePath}`);
  }
  
  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    // Mock implementation
  }
  
  async exists(filePath: string): Promise<boolean> {
    return true;
  }
  
  async ensureDirectory(dirPath: string): Promise<void> {
    // Mock implementation
  }
  
  getFileName(filePath: string): string {
    return filePath.split('/').pop() || '';
  }
  
  getDirectory(filePath: string): string {
    return filePath.substring(0, filePath.lastIndexOf('/'));
  }
}

describe('PdfProcessor', () => {
  let pdfProcessor: PdfProcessor;
  let mockOcrProvider: IOcrProvider;
  let mockFileService: IFileService;
  
  beforeEach(() => {
    mockOcrProvider = new MockOcrProvider();
    mockFileService = new MockFileService();
    pdfProcessor = new PdfProcessor(mockOcrProvider, mockFileService);
  });
  
  test('should process single file successfully', async () => {
    const result = await pdfProcessor.processFile('/path/to/test.pdf');
    
    expect(result.filePath).toBe('/path/to/test.pdf');
    expect(result.result.pages).toHaveLength(1);
    expect(result.result.pages[0].text).toBe('Processed test.pdf');
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.error).toBeUndefined();
  });
  
  test('should process multiple files', async () => {
    const files = ['/path/to/file1.pdf', '/path/to/file2.pdf'];
    const results = await pdfProcessor.processFiles(files);
    
    expect(results).toHaveLength(2);
    expect(results[0].filePath).toBe('/path/to/file1.pdf');
    expect(results[1].filePath).toBe('/path/to/file2.pdf');
  });
  
  test('should handle processing errors gracefully', async () => {
    // Override the mock to throw an error
    jest.spyOn(mockOcrProvider, 'processFile').mockRejectedValue(new Error('OCR failed'));
    
    const result = await pdfProcessor.processFile('/path/to/error.pdf');
    
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('OCR failed');
    expect(result.result.pages).toHaveLength(0);
  });
});