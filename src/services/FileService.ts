import { promises as fs } from 'fs';
import path from 'path';
import { IFileService } from '../interfaces/IFileService';

export class FileService implements IFileService {
  async readFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }
  
  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    try {
      await fs.writeFile(filePath, data);
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }
  
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error}`);
    }
  }
  
  getFileName(filePath: string): string {
    return path.basename(filePath);
  }
  
  getDirectory(filePath: string): string {
    return path.dirname(filePath);
  }
}