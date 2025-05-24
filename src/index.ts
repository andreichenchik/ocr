import { Container } from './container/Container';

async function main() {
  const container = new Container();
  
  try {
    // Get services from container
    const cliHandler = container.getCliHandler();
    const configuration = container.getConfiguration();
    const patternMatcher = container.getPatternMatcher();
    const orchestrator = container.getOcrOrchestrator();
    
    // Parse command-line arguments
    const args = process.argv.slice(2);
    const options = cliHandler.parseArguments(args);
    
    // Handle help request
    if (options.help) {
      cliHandler.showHelp();
      process.exit(0);
    }
    
    // Validate options
    cliHandler.validateOptions(options);
    
    // Verify API key is set
    try {
      configuration.getRequired('MISTRAL_API_KEY');
    } catch (error) {
      console.error('Error: MISTRAL_API_KEY environment variable is not set');
      console.log('Please set the API key in your .env file or environment variables');
      process.exit(1);
    }
    
    // Expand glob patterns to get actual file paths
    const inputFiles = await patternMatcher.expandPatterns(options.inputPatterns);
    
    if (inputFiles.length === 0) {
      console.log('No PDF files found matching the provided patterns.');
      process.exit(1);
    }
    
    console.log(`Found ${inputFiles.length} PDF file(s) to process.`);
    
    // Process files using orchestrator
    await orchestrator.processFiles(inputFiles, {
      outputDir: options.outputFolder || process.cwd(),
      combinedOutputFile: 'result.json'
    });
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    console.log('Use --help for usage information.');
    process.exit(1);
  }
}

// Call the main function if executed directly
if (require.main === module) {
  main();
}