import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import path from 'path';

// Initialize Mistral client
const initClient = (apiKey?: string): Mistral => {
  const key = apiKey || process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new Error('MISTRAL_API_KEY is required but not provided');
  }
  return new Mistral({apiKey: key});
};

// Process a single PDF file
async function processPdfFile(filePath: string, client?: Mistral): Promise<any> {
  try {
    // If no client is provided, initialize one
    const mistralClient = client || initClient();
    
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const uploadedPdf = await mistralClient.files.upload({
      file: {
        fileName: fileName,
        content: fileContent,
      },
      purpose: "ocr" as any
    });

    const signedUrl = await mistralClient.files.getSignedUrl({
      fileId: uploadedPdf.id,
    });

    const ocrResponse = await mistralClient.ocr.process({
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

export {
  initClient,
  processPdfFile,
  combineOcrResults,
  saveToJson
};