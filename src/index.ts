import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
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
 * @param {string} [outputDir] - Directory to save the output files (default: current directory)
 * @param {string} [combinedOutputFile] - Filename for the combined results (default: combinedOcrResult.json)
 * @param {boolean} [singleFileMode] - If true, only process the first PDF file (default: false)
 */
async function processOcr(
  pdfFiles: string[], 
  outputDir?: string, 
  combinedOutputFile: string = 'combinedOcrResult.json',
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

// Default function for command-line use
async function main() {
  // Example usage with default parameters
  const pdfFiles = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
  
  // Read command-line arguments if available
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const customPdfFiles = args;
    const outputDir = process.env.OCR_OUTPUT_DIR; // Can be set as environment variable
    const outputFile = process.env.OCR_COMBINED_OUTPUT || 'combinedOcrResult.json';
    
    await processOcr(customPdfFiles, outputDir, outputFile);
  } else {
    console.log('No command-line arguments detected. Using default PDF files list.');
    // Use default PDF files (for development)
    await processOcr(pdfFiles);
  }
}

// Call the main function if executed directly (not imported as a module)
if (require.main === module) {
  main();
} else {
  // Export the function for use in other modules
  module.exports = { processOcr };
}