import { MistralOcrProvider } from '../../src/services/MistralOcrProvider';
import { IConfiguration } from '../../src/interfaces/IConfiguration';
import { Mistral } from '@mistralai/mistralai';
import { OcrResult } from '../../src/models/OcrResult';

jest.mock('@mistralai/mistralai');

class MockConfiguration implements IConfiguration {
  private config: Record<string, string>;
  
  constructor(config: Record<string, string> = {}) {
    this.config = config;
  }
  
  get(key: string): string | undefined {
    return this.config[key];
  }
  
  getRequired(key: string): string {
    const value = this.config[key];
    if (!value) {
      throw new Error(`Configuration key ${key} is required but not found`);
    }
    return value;
  }
  
  has(key: string): boolean {
    return key in this.config;
  }
}

describe('MistralOcrProvider', () => {
  let provider: MistralOcrProvider;
  let mockConfiguration: IConfiguration;
  let mockMistralInstance: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Mistral instance
    mockMistralInstance = {
      files: {
        upload: jest.fn(),
        getSignedUrl: jest.fn()
      },
      ocr: {
        process: jest.fn()
      }
    };
    
    // Mock the Mistral constructor
    (Mistral as jest.MockedClass<typeof Mistral>).mockImplementation(() => mockMistralInstance);
    
    mockConfiguration = new MockConfiguration({
      MISTRAL_API_KEY: 'test-api-key'
    });
    
    provider = new MistralOcrProvider(mockConfiguration);
  });
  
  describe('constructor', () => {
    test('should initialize with valid API key', () => {
      expect(Mistral).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    });
    
    test('should throw error when API key is missing', () => {
      const invalidConfig = new MockConfiguration({});
      expect(() => new MistralOcrProvider(invalidConfig)).toThrow(
        'Configuration key MISTRAL_API_KEY is required but not found'
      );
    });
  });
  
  describe('processFile', () => {
    const mockFileContent = Buffer.from('PDF content');
    const mockFileName = 'test.pdf';
    const mockOcrResult: OcrResult = {
      pages: [
        { index: 0, text: 'Page 1 content' },
        { index: 1, text: 'Page 2 content' }
      ]
    };
    
    beforeEach(() => {
      mockMistralInstance.files.upload.mockResolvedValue({ id: 'file-123' });
      mockMistralInstance.files.getSignedUrl.mockResolvedValue({ url: 'https://signed-url.com' });
      mockMistralInstance.ocr.process.mockResolvedValue(mockOcrResult);
    });
    
    test('should process file successfully', async () => {
      const result = await provider.processFile(mockFileContent, mockFileName);
      
      expect(mockMistralInstance.files.upload).toHaveBeenCalledWith({
        file: {
          fileName: mockFileName,
          content: mockFileContent,
        },
        purpose: "ocr"
      });
      
      expect(mockMistralInstance.files.getSignedUrl).toHaveBeenCalledWith({
        fileId: 'file-123',
      });
      
      expect(mockMistralInstance.ocr.process).toHaveBeenCalledWith({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: 'https://signed-url.com',
        }
      });
      
      expect(result).toEqual(mockOcrResult);
    });
    
    test('should handle upload error', async () => {
      const uploadError = new Error('Upload failed');
      mockMistralInstance.files.upload.mockRejectedValue(uploadError);
      
      await expect(provider.processFile(mockFileContent, mockFileName)).rejects.toThrow(
        `OCR processing failed for file ${mockFileName}: Error: Upload failed`
      );
    });
    
    test('should handle signed URL error', async () => {
      const signedUrlError = new Error('Failed to get signed URL');
      mockMistralInstance.files.getSignedUrl.mockRejectedValue(signedUrlError);
      
      await expect(provider.processFile(mockFileContent, mockFileName)).rejects.toThrow(
        `OCR processing failed for file ${mockFileName}: Error: Failed to get signed URL`
      );
    });
    
    test('should handle OCR processing error', async () => {
      const ocrError = new Error('OCR processing failed');
      mockMistralInstance.ocr.process.mockRejectedValue(ocrError);
      
      await expect(provider.processFile(mockFileContent, mockFileName)).rejects.toThrow(
        `OCR processing failed for file ${mockFileName}: Error: OCR processing failed`
      );
    });
    
    test('should handle empty file content', async () => {
      const emptyBuffer = Buffer.from('');
      const result = await provider.processFile(emptyBuffer, 'empty.pdf');
      
      expect(mockMistralInstance.files.upload).toHaveBeenCalledWith({
        file: {
          fileName: 'empty.pdf',
          content: emptyBuffer,
        },
        purpose: "ocr"
      });
      
      expect(result).toEqual(mockOcrResult);
    });
  });
  
  describe('getProviderName', () => {
    test('should return correct provider name', () => {
      expect(provider.getProviderName()).toBe('Mistral AI OCR');
    });
  });
});