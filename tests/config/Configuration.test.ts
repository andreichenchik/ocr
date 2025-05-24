import { Configuration } from '../../src/config/Configuration';
import dotenv from 'dotenv';

// Mock dotenv
jest.mock('dotenv');

describe('Configuration', () => {
  let configuration: Configuration;
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    
    // Mock dotenv.config to do nothing
    (dotenv.config as jest.Mock).mockImplementation(() => ({}));
  });
  
  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });
  
  describe('constructor', () => {
    test('should load dotenv configuration', () => {
      configuration = new Configuration();
      expect(dotenv.config).toHaveBeenCalled();
    });
    
    test('should use process.env as config source', () => {
      process.env.TEST_KEY = 'test_value';
      configuration = new Configuration();
      
      expect(configuration.get('TEST_KEY')).toBe('test_value');
    });
  });
  
  describe('get', () => {
    beforeEach(() => {
      process.env = {
        EXISTING_KEY: 'existing_value',
        EMPTY_KEY: '',
        NUMERIC_KEY: '12345'
      };
      configuration = new Configuration();
    });
    
    test('should return value for existing key', () => {
      expect(configuration.get('EXISTING_KEY')).toBe('existing_value');
    });
    
    test('should return undefined for non-existing key', () => {
      expect(configuration.get('NON_EXISTING_KEY')).toBeUndefined();
    });
    
    test('should return empty string for empty value', () => {
      expect(configuration.get('EMPTY_KEY')).toBe('');
    });
    
    test('should return numeric value as string', () => {
      expect(configuration.get('NUMERIC_KEY')).toBe('12345');
    });
  });
  
  describe('getRequired', () => {
    beforeEach(() => {
      process.env = {
        REQUIRED_KEY: 'required_value',
        EMPTY_KEY: ''
      };
      configuration = new Configuration();
    });
    
    test('should return value for existing required key', () => {
      expect(configuration.getRequired('REQUIRED_KEY')).toBe('required_value');
    });
    
    test('should throw error for non-existing key', () => {
      expect(() => configuration.getRequired('MISSING_KEY')).toThrow(
        "Required configuration 'MISSING_KEY' is not set"
      );
    });
    
    test('should throw error for empty value', () => {
      expect(() => configuration.getRequired('EMPTY_KEY')).toThrow(
        "Required configuration 'EMPTY_KEY' is not set"
      );
    });
    
    test('should throw descriptive error message', () => {
      expect(() => configuration.getRequired('API_KEY')).toThrow(
        "Required configuration 'API_KEY' is not set"
      );
    });
  });
  
  describe('has', () => {
    beforeEach(() => {
      process.env = {
        EXISTING_KEY: 'value',
        EMPTY_KEY: '',
        UNDEFINED_KEY: undefined as any
      };
      configuration = new Configuration();
    });
    
    test('should return true for existing key with value', () => {
      expect(configuration.has('EXISTING_KEY')).toBe(true);
    });
    
    test('should return true for existing key with empty value', () => {
      expect(configuration.has('EMPTY_KEY')).toBe(true);
    });
    
    test('should return false for non-existing key', () => {
      expect(configuration.has('NON_EXISTING_KEY')).toBe(false);
    });
    
    test('should return false for explicitly undefined key', () => {
      expect(configuration.has('UNDEFINED_KEY')).toBe(false);
    });
  });
  
  describe('edge cases', () => {
    test('should handle special characters in keys', () => {
      process.env['SPECIAL-KEY.NAME'] = 'special_value';
      configuration = new Configuration();
      
      expect(configuration.get('SPECIAL-KEY.NAME')).toBe('special_value');
      expect(configuration.has('SPECIAL-KEY.NAME')).toBe(true);
    });
    
    test('should handle numeric keys', () => {
      process.env['123'] = 'numeric_key_value';
      configuration = new Configuration();
      
      expect(configuration.get('123')).toBe('numeric_key_value');
    });
    
    test('should handle multiline values', () => {
      process.env.MULTILINE = 'line1\nline2\nline3';
      configuration = new Configuration();
      
      expect(configuration.get('MULTILINE')).toBe('line1\nline2\nline3');
    });
    
    test('should be case-sensitive for keys', () => {
      process.env.lowercase = 'lower';
      process.env.LOWERCASE = 'upper';
      configuration = new Configuration();
      
      expect(configuration.get('lowercase')).toBe('lower');
      expect(configuration.get('LOWERCASE')).toBe('upper');
    });
  });
});