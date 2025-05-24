export interface IConfiguration {
  /**
   * Get a configuration value
   * @param key Configuration key
   * @returns Configuration value or undefined
   */
  get(key: string): string | undefined;
  
  /**
   * Get a required configuration value
   * @param key Configuration key
   * @returns Configuration value
   * @throws Error if configuration is not found
   */
  getRequired(key: string): string;
  
  /**
   * Check if a configuration exists
   * @param key Configuration key
   * @returns True if configuration exists
   */
  has(key: string): boolean;
}