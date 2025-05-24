import { IConfiguration } from '../interfaces/IConfiguration';
import dotenv from 'dotenv';

export class Configuration implements IConfiguration {
  private config: Record<string, string | undefined>;
  
  constructor() {
    dotenv.config();
    this.config = process.env;
  }
  
  get(key: string): string | undefined {
    return this.config[key];
  }
  
  getRequired(key: string): string {
    const value = this.config[key];
    if (!value) {
      throw new Error(`Required configuration '${key}' is not set`);
    }
    return value;
  }
  
  has(key: string): boolean {
    return this.config[key] !== undefined;
  }
}