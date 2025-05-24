import { FileService } from '../../src/services/FileService';
import { promises as fs } from 'fs';
import path from 'path';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn()
  }
}));

describe('FileService', () => {
  let fileService: FileService;
  const mockFs = fs as jest.Mocked<typeof fs>;
  
  beforeEach(() => {
    fileService = new FileService();
    jest.clearAllMocks();
  });
  
  describe('readFile', () => {
    test('should read file successfully', async () => {
      const filePath = '/path/to/file.pdf';
      const fileContent = Buffer.from('PDF content');
      mockFs.readFile.mockResolvedValue(fileContent);
      
      const result = await fileService.readFile(filePath);
      
      expect(result).toEqual(fileContent);
      expect(mockFs.readFile).toHaveBeenCalledWith(filePath);
    });
    
    test('should throw error when file read fails', async () => {
      const filePath = '/path/to/nonexistent.pdf';
      const error = new Error('ENOENT: no such file or directory');
      mockFs.readFile.mockRejectedValue(error);
      
      await expect(fileService.readFile(filePath)).rejects.toThrow(
        `Failed to read file ${filePath}: Error: ENOENT: no such file or directory`
      );
    });
  });
  
  describe('writeFile', () => {
    test('should write string data successfully', async () => {
      const filePath = '/path/to/output.json';
      const data = 'JSON content';
      mockFs.writeFile.mockResolvedValue(undefined);
      
      await fileService.writeFile(filePath, data);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, data);
    });
    
    test('should write buffer data successfully', async () => {
      const filePath = '/path/to/output.bin';
      const data = Buffer.from('Binary content');
      mockFs.writeFile.mockResolvedValue(undefined);
      
      await fileService.writeFile(filePath, data);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, data);
    });
    
    test('should throw error when file write fails', async () => {
      const filePath = '/readonly/file.txt';
      const error = new Error('EACCES: permission denied');
      mockFs.writeFile.mockRejectedValue(error);
      
      await expect(fileService.writeFile(filePath, 'data')).rejects.toThrow(
        `Failed to write file ${filePath}: Error: EACCES: permission denied`
      );
    });
  });
  
  describe('exists', () => {
    test('should return true when file exists', async () => {
      const filePath = '/path/to/existing.pdf';
      mockFs.access.mockResolvedValue(undefined);
      
      const result = await fileService.exists(filePath);
      
      expect(result).toBe(true);
      expect(mockFs.access).toHaveBeenCalledWith(filePath);
    });
    
    test('should return false when file does not exist', async () => {
      const filePath = '/path/to/nonexistent.pdf';
      mockFs.access.mockRejectedValue(new Error('ENOENT'));
      
      const result = await fileService.exists(filePath);
      
      expect(result).toBe(false);
      expect(mockFs.access).toHaveBeenCalledWith(filePath);
    });
  });
  
  describe('ensureDirectory', () => {
    test('should create directory successfully', async () => {
      const dirPath = '/path/to/new/directory';
      mockFs.mkdir.mockResolvedValue(undefined);
      
      await fileService.ensureDirectory(dirPath);
      
      expect(mockFs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
    });
    
    test('should throw error when directory creation fails', async () => {
      const dirPath = '/readonly/directory';
      const error = new Error('EACCES: permission denied');
      mockFs.mkdir.mockRejectedValue(error);
      
      await expect(fileService.ensureDirectory(dirPath)).rejects.toThrow(
        `Failed to create directory ${dirPath}: Error: EACCES: permission denied`
      );
    });
  });
  
  describe('getFileName', () => {
    test('should extract filename from path', () => {
      expect(fileService.getFileName('/path/to/file.pdf')).toBe('file.pdf');
      expect(fileService.getFileName(path.join('Users', 'test', 'document.pdf'))).toBe('document.pdf');
      expect(fileService.getFileName('file.txt')).toBe('file.txt');
    });
    
    test('should handle edge cases', () => {
      expect(fileService.getFileName('')).toBe('');
      expect(fileService.getFileName('/')).toBe('');
      expect(fileService.getFileName('/path/to/')).toBe('to');
    });
  });
  
  describe('getDirectory', () => {
    test('should extract directory from path', () => {
      expect(fileService.getDirectory('/path/to/file.pdf')).toBe('/path/to');
      expect(fileService.getDirectory(path.join('Users', 'test', 'document.pdf'))).toBe(path.join('Users', 'test'));
      expect(fileService.getDirectory('file.txt')).toBe('.');
    });
    
    test('should handle edge cases', () => {
      expect(fileService.getDirectory('')).toBe('.');
      expect(fileService.getDirectory('/')).toBe('/');
      expect(fileService.getDirectory('/file.txt')).toBe('/');
    });
  });
});