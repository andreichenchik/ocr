export interface IPatternMatcher {
  /**
   * Expand glob patterns to match files
   * @param patterns Array of patterns (can be glob patterns or direct file paths)
   * @returns Promise with array of matched file paths
   */
  expandPatterns(patterns: string[]): Promise<string[]>;
  
  /**
   * Check if a pattern is a glob pattern
   * @param pattern Pattern to check
   * @returns True if it's a glob pattern
   */
  isGlobPattern(pattern: string): boolean;
}