import { Mistral } from '@mistralai/mistralai';
import { IOcrProvider } from '../interfaces/IOcrProvider';
import { IConfiguration } from '../interfaces/IConfiguration';
import { OcrResult } from '../models/OcrResult';

export class MistralOcrProvider implements IOcrProvider {
  private client: Mistral;
  
  constructor(private configuration: IConfiguration) {
    const apiKey = this.configuration.getRequired('MISTRAL_API_KEY');
    this.client = new Mistral({ apiKey });
  }
  
  async processFile(fileContent: Buffer, fileName: string): Promise<OcrResult> {
    try {
      // Upload the file
      const uploadedPdf = await this.client.files.upload({
        file: {
          fileName,
          content: fileContent,
        },
        purpose: "ocr" as any
      });
      
      // Get signed URL
      const signedUrl = await this.client.files.getSignedUrl({
        fileId: uploadedPdf.id,
      });
      
      // Process OCR
      const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: signedUrl.url,
        }
      });
      
      return ocrResponse as OcrResult;
    } catch (error) {
      throw new Error(`OCR processing failed for file ${fileName}: ${error}`);
    }
  }
  
  getProviderName(): string {
    return 'Mistral AI OCR';
  }
}