import { IResultAggregator } from '../interfaces/IResultAggregator';
import { OcrResult, OcrPage } from '../models/OcrResult';

export class ResultAggregator implements IResultAggregator {
  combineResults(results: OcrResult[]): OcrResult {
    if (results.length === 0) {
      return { pages: [] };
    }
    
    if (results.length === 1) {
      return results[0];
    }
    
    // Clone the first result to use as base
    const combined: OcrResult = {
      ...results[0],
      pages: [...results[0].pages]
    };
    
    let pageOffset = combined.pages.length;
    
    // Merge remaining results
    for (let i = 1; i < results.length; i++) {
      const result = results[i];
      
      // Adjust page indices and add to combined result
      const adjustedPages = result.pages.map((page: OcrPage) => ({
        ...page,
        index: page.index + pageOffset
      }));
      
      combined.pages = combined.pages.concat(adjustedPages);
      pageOffset += result.pages.length;
      
      // Merge metadata if present
      if (result.metadata && combined.metadata) {
        combined.metadata = {
          ...combined.metadata,
          ...result.metadata
        };
      }
    }
    
    return combined;
  }
}