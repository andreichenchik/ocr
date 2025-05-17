import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { glob } from 'glob';
dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({apiKey: apiKey});

// Function to save object to JSON file
function saveToJson(data: any, filename: string, outputDir?: string): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    // Use the provided output directory or fall back to current working directory
    const baseDir = outputDir ? outputDir : process.cwd();
    const filePath = path.join(baseDir, filename);
    
    // Ensure the directory exists
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    
    fs.writeFileSync(filePath, jsonString);
    console.log(`Data successfully saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving data to JSON file:', error);
  }
}

// Process a single PDF file
async function processPdfFile(filePath: string): Promise<any> {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const uploadedPdf = await client.files.upload({
      file: {
        fileName: fileName,
        content: fileContent,
      },
      purpose: "ocr" as any
    });

    const signedUrl = await client.files.getSignedUrl({
      fileId: uploadedPdf.id,
    });

    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: signedUrl.url,
      }
    });
    
    return ocrResponse;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    throw error;
  }
}

// Combine OCR results, adjusting page indices
function combineOcrResults(results: any[]): any {
  if (results.length === 0) return { pages: [] };
  
  const combined = { ...results[0] }; // Clone the first result
  let pageOffset = combined.pages.length;
  
  // Start from the second result
  for (let i = 1; i < results.length; i++) {
    const result = results[i];
    
    // Adjust page indices and add to combined result
    const adjustedPages = result.pages.map((page: any) => {
      return {
        ...page,
        index: page.index + pageOffset
      };
    });
    
    combined.pages = combined.pages.concat(adjustedPages);
    pageOffset += result.pages.length;
  }
  
  return combined;
}

/**
 * Process PDF files and extract text using OCR
 * @param {string[]} pdfFiles - Array of PDF file paths to process
 * @param {string} [outputDir] - Directory to save the output files (default: current working directory)
 * @param {string} [combinedOutputFile] - Filename for the combined results (default: result.json)
 * @param {boolean} [singleFileMode] - If true, only process the first PDF file (default: false)
 */
async function processOcr(
  pdfFiles: string[], 
  outputDir: string = process.cwd(), 
  combinedOutputFile: string = 'result.json',
  singleFileMode: boolean = false
): Promise<void> {
  try {
    if (pdfFiles.length === 0) {
      console.error('No PDF files provided for processing');
      return;
    }
    
    // If in single file mode, only process the first file
    const filesToProcess = singleFileMode ? [pdfFiles[0]] : pdfFiles;
    const ocrResults = [];
    
    // Process each PDF file
    for (const file of filesToProcess) {
      console.log(`Processing ${file}...`);
      const result = await processPdfFile(file);
      ocrResults.push(result);
      
      // Save individual result with custom output directory
      const outputFilename = `ocr_${path.basename(file).replace('.pdf', '')}.json`;
      saveToJson(result, outputFilename, outputDir);
    }
    
    // Skip combined result if only processing a single file
    if (filesToProcess.length > 1) {
      // Combine results with adjusted page indices
      const combinedResult = combineOcrResults(ocrResults);
      
      // Save combined result with custom output directory and filename
      saveToJson(combinedResult, combinedOutputFile, outputDir);
    }
    
    console.log('All files processed successfully!');
    
  } catch (error) {
    console.error('Error in OCR process:', error);
  }
}

// Expand glob patterns to match PDF files
async function expandGlobPatterns(patterns: string[]): Promise<string[]> {
  let expandedFiles: string[] = [];
  
  for (const pattern of patterns) {
    // Check if it's a glob pattern or a direct file path
    if (pattern.includes('*') || pattern.includes('?') || pattern.includes('[')) {
      // It's a glob pattern, expand it
      const matches = await glob(pattern, { nodir: true });
      
      // Filter for PDF files
      const pdfMatches = matches.filter(file => file.toLowerCase().endsWith('.pdf'));
      expandedFiles = [...expandedFiles, ...pdfMatches];
    } else {
      // It's a direct file path, check if it exists and is a PDF
      if (fs.existsSync(pattern) && pattern.toLowerCase().endsWith('.pdf')) {
        expandedFiles.push(pattern);
      } else if (!pattern.toLowerCase().endsWith('.pdf')) {
        console.warn(`Warning: ${pattern} is not a PDF file and will be skipped.`);
      } else {
        console.warn(`Warning: File ${pattern} not found.`);
      }
    }
  }
  
  return expandedFiles;
}

// Display help information
function showHelp(): void {
  console.log(`
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
  `);
  process.exit(0);
}

// Default function for command-line use
async function main() {
  // Default output filename
  const defaultOutputFilename = 'result.json';
  
  // Parse command-line arguments
  const args = process.argv.slice(2);
  let outputFilename = defaultOutputFilename;
  let inputPatterns: string[] = [];
  
  // Check if help is requested
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--output' || arg === '-o') {
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        outputFilename = args[i + 1];
        // Skip the next argument (the filename)
        i++;
      } else {
        console.error('Error: --output option requires a filename argument');
        process.exit(1);
      }
    } else if (arg.startsWith('-')) {
      console.error(`Error: Unknown option: ${arg}`);
      console.log('Use --help to see available options');
      process.exit(1);
    } else {
      // It's an input file pattern
      inputPatterns.push(arg);
    }
  }
  
  // Verify API key is set
  if (!process.env.MISTRAL_API_KEY) {
    console.error('Error: MISTRAL_API_KEY environment variable is not set');
    console.log('Please set the API key in your .env file or environment variables');
    process.exit(1);
  }
  
  // Check if we have any input patterns
  if (inputPatterns.length > 0) {
    // Always use current directory for output
    const outputDir = process.cwd();
    
    // Expand glob patterns to get actual file paths
    const inputFiles = await expandGlobPatterns(inputPatterns);
    
    if (inputFiles.length === 0) {
      console.log('No PDF files found matching the provided patterns.');
      process.exit(1);
    }
    
    console.log(`Found ${inputFiles.length} PDF file(s) to process.`);
    await processOcr(inputFiles, outputDir, outputFilename);
  } else {
    console.log('No input files specified. Please provide at least one PDF file or pattern.');
    console.log('Use --help for usage information.');
    process.exit(1);
  }
}

// Call the main function if executed directly (not imported as a module)
if (require.main === module) {
  main();
} else {
  // Export the function for use in other modules
  module.exports = { processOcr };
}