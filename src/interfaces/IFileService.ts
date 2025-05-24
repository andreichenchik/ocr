export interface IFileService {
  /**
   * Read file content as Buffer
   * @param filePath Path to the file
   * @returns Promise with file content
   */
  readFile(filePath: string): Promise<Buffer>;
  
  /**
   * Write data to a file
   * @param filePath Path to the file
   * @param data Data to write
   * @returns Promise that resolves when write is complete
   */
  writeFile(filePath: string, data: string | Buffer): Promise<void>;
  
  /**
   * Check if file exists
   * @param filePath Path to the file
   * @returns Promise with boolean result
   */
  exists(filePath: string): Promise<boolean>;
  
  /**
   * Create directory if it doesn't exist
   * @param dirPath Path to the directory
   * @returns Promise that resolves when directory is created
   */
  ensureDirectory(dirPath: string): Promise<void>;
  
  /**
   * Get file name from path
   * @param filePath Path to the file
   * @returns File name
   */
  getFileName(filePath: string): string;
  
  /**
   * Get directory from path
   * @param filePath Path to the file
   * @returns Directory path
   */
  getDirectory(filePath: string): string;
}