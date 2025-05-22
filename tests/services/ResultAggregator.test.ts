import { ResultAggregator } from '../../src/services/ResultAggregator';
import { OcrResult } from '../../src/models/OcrResult';

describe('ResultAggregator', () => {
  let aggregator: ResultAggregator;
  
  beforeEach(() => {
    aggregator = new ResultAggregator();
  });
  
  test('should return empty result when no results provided', () => {
    const result = aggregator.combineResults([]);
    expect(result).toEqual({ pages: [] });
  });
  
  test('should return single result unchanged', () => {
    const singleResult: OcrResult = {
      pages: [{ index: 0, text: 'Page 1' }]
    };
    
    const result = aggregator.combineResults([singleResult]);
    expect(result).toEqual(singleResult);
  });
  
  test('should combine multiple results with adjusted indices', () => {
    const result1: OcrResult = {
      pages: [
        { index: 0, text: 'Page 1' },
        { index: 1, text: 'Page 2' }
      ]
    };
    
    const result2: OcrResult = {
      pages: [
        { index: 0, text: 'Page 3' },
        { index: 1, text: 'Page 4' }
      ]
    };
    
    const combined = aggregator.combineResults([result1, result2]);
    
    expect(combined.pages).toHaveLength(4);
    expect(combined.pages[0].index).toBe(0);
    expect(combined.pages[1].index).toBe(1);
    expect(combined.pages[2].index).toBe(2); // Adjusted index
    expect(combined.pages[3].index).toBe(3); // Adjusted index
  });
  
  test('should merge metadata from multiple results', () => {
    const result1: OcrResult = {
      pages: [{ index: 0 }],
      metadata: { source: 'file1', pages: 1 }
    };
    
    const result2: OcrResult = {
      pages: [{ index: 0 }],
      metadata: { source: 'file2', totalPages: 2 }
    };
    
    const combined = aggregator.combineResults([result1, result2]);
    
    expect(combined.metadata).toEqual({
      source: 'file2',
      pages: 1,
      totalPages: 2
    });
  });
});