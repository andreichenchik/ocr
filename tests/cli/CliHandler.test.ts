import { CliHandler } from '../../src/cli/CliHandler';

describe('CliHandler', () => {
  let cliHandler: CliHandler;
  
  beforeEach(() => {
    cliHandler = new CliHandler();
  });
  
  describe('parseArguments', () => {
    test('should parse help flag', () => {
      const options = cliHandler.parseArguments(['--help']);
      expect(options.help).toBe(true);
    });
    
    test('should parse output file option with long form', () => {
      const options = cliHandler.parseArguments(['--output', 'custom.json', 'file.pdf']);
      expect(options.outputFile).toBe('custom.json');
      expect(options.inputPatterns).toEqual(['file.pdf']);
    });
    
    test('should parse output file option with short form', () => {
      const options = cliHandler.parseArguments(['-o', 'result.json', 'doc.pdf']);
      expect(options.outputFile).toBe('result.json');
      expect(options.inputPatterns).toEqual(['doc.pdf']);
    });
    
    test('should parse multiple input patterns', () => {
      const options = cliHandler.parseArguments(['file1.pdf', 'file2.pdf', '*.pdf']);
      expect(options.inputPatterns).toEqual(['file1.pdf', 'file2.pdf', '*.pdf']);
    });
    
    test('should throw error for unknown option', () => {
      expect(() => cliHandler.parseArguments(['--unknown'])).toThrow('Unknown option: --unknown');
    });
    
    test('should throw error when output option missing argument', () => {
      expect(() => cliHandler.parseArguments(['--output'])).toThrow('--output option requires a filename argument');
    });
  });
  
  describe('validateOptions', () => {
    test('should not throw for valid options', () => {
      const options = { inputPatterns: ['file.pdf'] };
      expect(() => cliHandler.validateOptions(options)).not.toThrow();
    });
    
    test('should throw when no input files provided', () => {
      const options = { inputPatterns: [] };
      expect(() => cliHandler.validateOptions(options)).toThrow('No input files specified');
    });
    
    test('should not validate when help is requested', () => {
      const options = { inputPatterns: [], help: true };
      expect(() => cliHandler.validateOptions(options)).not.toThrow();
    });
  });
});