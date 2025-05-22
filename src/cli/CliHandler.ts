export interface CliOptions {
  outputFile?: string;
  help?: boolean;
  inputPatterns: string[];
}

export class CliHandler {
  private readonly helpText = `
OCR Tool Usage:
--------------
Process PDF files using Mistral AI OCR API.

Arguments:
  [files]                 PDF file(s) to process. Supports glob patterns like "*.pdf"
  
Options:
  -o, --output <file>     Output file name for results (default: "result.json")
  -h, --help              Show this help message

Environment Variables:
  MISTRAL_API_KEY         Required API key for Mistral AI

Examples:
  npm run ocr -- sample.pdf
  npm run ocr -- --output results.json "docs/*.pdf"
  npm run ocr -- -o custom.json file1.pdf file2.pdf
  `;
  
  parseArguments(args: string[]): CliOptions {
    const options: CliOptions = {
      inputPatterns: []
    };
    
    // Check if help is requested
    if (args.includes('--help') || args.includes('-h')) {
      options.help = true;
      return options;
    }
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--output' || arg === '-o') {
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          options.outputFile = args[i + 1];
          i++; // Skip the next argument
        } else {
          throw new Error('--output option requires a filename argument');
        }
      } else if (arg.startsWith('-')) {
        throw new Error(`Unknown option: ${arg}`);
      } else {
        // It's an input file pattern
        options.inputPatterns.push(arg);
      }
    }
    
    return options;
  }
  
  showHelp(): void {
    console.log(this.helpText);
  }
  
  validateOptions(options: CliOptions): void {
    if (!options.help && options.inputPatterns.length === 0) {
      throw new Error('No input files specified. Please provide at least one PDF file or pattern.');
    }
  }
}