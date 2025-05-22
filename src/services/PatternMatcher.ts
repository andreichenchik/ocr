import { glob } from 'glob';
import { IPatternMatcher } from '../interfaces/IPatternMatcher';
import { IFileService } from '../interfaces/IFileService';

export class PatternMatcher implements IPatternMatcher {
  constructor(private fileService: IFileService) {}
  
  async expandPatterns(patterns: string[]): Promise<string[]> {
    const expandedFiles: string[] = [];
    const processedPaths = new Set<string>();
    
    for (const pattern of patterns) {
      if (this.isGlobPattern(pattern)) {
        // Expand glob pattern
        const matches = await glob(pattern, { nodir: true });
        
        // Filter for PDF files and add unique paths
        for (const match of matches) {
          if (match.toLowerCase().endsWith('.pdf') && !processedPaths.has(match)) {
            expandedFiles.push(match);
            processedPaths.add(match);
          }
        }
      } else {
        // Direct file path
        if (await this.fileService.exists(pattern)) {
          if (pattern.toLowerCase().endsWith('.pdf') && !processedPaths.has(pattern)) {
            expandedFiles.push(pattern);
            processedPaths.add(pattern);
          } else if (!pattern.toLowerCase().endsWith('.pdf')) {
            console.warn(`Warning: ${pattern} is not a PDF file and will be skipped.`);
          }
        } else {
          console.warn(`Warning: File ${pattern} not found.`);
        }
      }
    }
    
    return expandedFiles;
  }
  
  isGlobPattern(pattern: string): boolean {
    return pattern.includes('*') || pattern.includes('?') || pattern.includes('[');
  }
}