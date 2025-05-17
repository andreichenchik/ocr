import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({apiKey: apiKey});

// Function to save object to JSON file
function saveToJson(data: any, filename: string): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const filePath = path.join(process.cwd(), filename);
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

async function main() {
  try {
    const pdfFiles = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
    const ocrResults = [];
    
    // Process each PDF file
    for (const file of pdfFiles) {
      console.log(`Processing ${file}...`);
      const result = await processPdfFile(file);
      ocrResults.push(result);
      
      // Save individual result
      saveToJson(result, `ocr_${file.replace('.pdf', '')}.json`);
    }
    
    // Combine results with adjusted page indices
    const combinedResult = combineOcrResults(ocrResults);
    
    // Save combined result
    saveToJson(combinedResult, 'combinedOcrResult.json');
    console.log('All files processed and combined successfully!');
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Call the main function
main();