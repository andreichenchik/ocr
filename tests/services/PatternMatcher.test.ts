import { PatternMatcher } from '../../src/services/PatternMatcher';
import { IFileService } from '../../src/interfaces/IFileService';
import { glob } from 'glob';

// Mock the glob module
jest.mock('glob');

// Mock FileService implementation
class MockFileService implements IFileService {
  readFile = jest.fn();
  writeFile = jest.fn();
  exists = jest.fn();
  ensureDirectory = jest.fn();
  getFileName = jest.fn();
  getDirectory = jest.fn();
}

describe('PatternMatcher', () => {
  let patternMatcher: PatternMatcher;
  let mockFileService: MockFileService;
  let consoleWarnSpy: jest.SpyInstance;
  const mockGlob = glob as jest.MockedFunction<typeof glob>;
  
  beforeEach(() => {
    mockFileService = new MockFileService();
    patternMatcher = new PatternMatcher(mockFileService);
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });
  
  describe('expandPatterns', () => {
    test('should expand glob patterns to PDF files', async () => {
      const patterns = ['docs/*.pdf'];
      mockGlob.mockResolvedValue(['docs/file1.pdf', 'docs/file2.pdf']);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(mockGlob).toHaveBeenCalledWith('docs/*.pdf', { nodir: true });
      expect(result).toEqual(['docs/file1.pdf', 'docs/file2.pdf']);
    });
    
    test('should handle direct file paths', async () => {
      const patterns = ['file1.pdf', 'file2.pdf'];
      mockFileService.exists.mockResolvedValue(true);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(mockFileService.exists).toHaveBeenCalledWith('file1.pdf');
      expect(mockFileService.exists).toHaveBeenCalledWith('file2.pdf');
      expect(result).toEqual(['file1.pdf', 'file2.pdf']);
    });
    
    test('should mix glob patterns and direct paths', async () => {
      const patterns = ['docs/*.pdf', 'single.pdf'];
      mockGlob.mockResolvedValue(['docs/file1.pdf', 'docs/file2.pdf']);
      mockFileService.exists.mockResolvedValue(true);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(result).toEqual(['docs/file1.pdf', 'docs/file2.pdf', 'single.pdf']);
    });
    
    test('should filter out non-PDF files from glob results', async () => {
      const patterns = ['docs/*'];
      mockGlob.mockResolvedValue(['docs/file1.pdf', 'docs/file2.txt', 'docs/file3.PDF']);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(result).toEqual(['docs/file1.pdf', 'docs/file3.PDF']);
    });
    
    test('should warn about non-PDF direct files', async () => {
      const patterns = ['file.txt'];
      mockFileService.exists.mockResolvedValue(true);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: file.txt is not a PDF file and will be skipped.');
    });
    
    test('should warn about non-existent files', async () => {
      const patterns = ['missing.pdf'];
      mockFileService.exists.mockResolvedValue(false);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: File missing.pdf not found.');
    });
    
    test('should handle empty pattern array', async () => {
      const result = await patternMatcher.expandPatterns([]);
      expect(result).toEqual([]);
    });
    
    test('should deduplicate files', async () => {
      const patterns = ['*.pdf', 'docs/*.pdf', 'file1.pdf'];
      mockGlob.mockImplementation(async (pattern) => {
        if (pattern === '*.pdf') return ['file1.pdf', 'file2.pdf'];
        if (pattern === 'docs/*.pdf') return ['docs/file3.pdf', 'docs/file1.pdf'];
        return [];
      });
      mockFileService.exists.mockResolvedValue(true);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(result).toEqual(['file1.pdf', 'file2.pdf', 'docs/file3.pdf', 'docs/file1.pdf']);
    });
    
    test('should handle case-insensitive PDF extension', async () => {
      const patterns = ['files/*'];
      mockGlob.mockResolvedValue(['files/doc1.PDF', 'files/doc2.pDf', 'files/doc3.pdf']);
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(result).toEqual(['files/doc1.PDF', 'files/doc2.pDf', 'files/doc3.pdf']);
    });
    
    test('should handle glob patterns with special characters', async () => {
      const patterns = ['docs/[a-z]*.pdf', 'files/doc?.pdf'];
      mockGlob.mockImplementation(async (pattern) => {
        if (pattern === 'docs/[a-z]*.pdf') return ['docs/abc.pdf', 'docs/def.pdf'];
        if (pattern === 'files/doc?.pdf') return ['files/doc1.pdf', 'files/doc2.pdf'];
        return [];
      });
      
      const result = await patternMatcher.expandPatterns(patterns);
      
      expect(mockGlob).toHaveBeenCalledTimes(2);
      expect(result).toEqual(['docs/abc.pdf', 'docs/def.pdf', 'files/doc1.pdf', 'files/doc2.pdf']);
    });
  });
  
  describe('isGlobPattern', () => {
    test('should identify patterns with asterisk', () => {
      expect(patternMatcher.isGlobPattern('*.pdf')).toBe(true);
      expect(patternMatcher.isGlobPattern('docs/*.pdf')).toBe(true);
      expect(patternMatcher.isGlobPattern('**/*.pdf')).toBe(true);
    });
    
    test('should identify patterns with question mark', () => {
      expect(patternMatcher.isGlobPattern('file?.pdf')).toBe(true);
      expect(patternMatcher.isGlobPattern('doc?.pdf')).toBe(true);
    });
    
    test('should identify patterns with brackets', () => {
      expect(patternMatcher.isGlobPattern('[abc].pdf')).toBe(true);
      expect(patternMatcher.isGlobPattern('file[0-9].pdf')).toBe(true);
    });
    
    test('should return false for non-glob patterns', () => {
      expect(patternMatcher.isGlobPattern('file.pdf')).toBe(false);
      expect(patternMatcher.isGlobPattern('/path/to/file.pdf')).toBe(false);
      expect(patternMatcher.isGlobPattern('simple-name.pdf')).toBe(false);
    });
  });
});