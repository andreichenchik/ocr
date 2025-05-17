# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OCR (Optical Character Recognition) tool built with TypeScript that uses the Mistral AI API to process PDF documents. The application can:

1. Process individual PDF files for OCR
2. Combine OCR results from multiple files
3. Save OCR results as JSON files with customizable output locations

## Environment Setup

The project requires a `.env` file in the root directory with the following variables:
```
MISTRAL_API_KEY=your_mistral_api_key_here
OCR_OUTPUT_DIR=/path/to/output/directory (optional)
OCR_COMBINED_OUTPUT=combined_results.json (optional)
```

## Commands

### Build and Run with Default Settings
```
npm run ocr
```
This command compiles the TypeScript code and runs the OCR process on the default PDF files.

### Process Specific PDF Files
```
npm run ocr file1.pdf file2.pdf
```
or
```
node dist/index.js file1.pdf file2.pdf
```
Process specific PDF files passed as command-line arguments.

### Customizing Output
Use the environment variables to customize output:
```
OCR_OUTPUT_DIR=/custom/path OCR_COMBINED_OUTPUT=results.json npm run ocr file1.pdf file2.pdf
```

### TypeScript Compilation
```
tsc
```
Compiles the TypeScript code to JavaScript in the `/dist` directory.

## Project Structure

- `src/index.ts` - Main application file containing all the OCR processing logic
- Files are output to the specified directory or current working directory:
  - Individual OCR results: `ocr_filename.json`
  - Combined results: Customizable (default: `combinedOcrResult.json`)

## Important Notes

1. PDF files can be specified as command-line arguments
2. The application uses the Mistral AI API for OCR processing
3. Output directory and filenames are now customizable
4. OCR results are saved as JSON files

## Development Workflow

1. Define PDF files to process via command-line arguments or use defaults
2. Optionally set environment variables for output customization
3. Run `npm run ocr` to process the files
4. Check the generated JSON files in the specified output location

## API Usage

The project exposes a `processOcr` function with the following parameters:

```typescript
processOcr(
  pdfFiles: string[], 
  outputDir?: string, 
  combinedOutputFile: string = 'combinedOcrResult.json',
  singleFileMode: boolean = false
): Promise<void>
```
- `pdfFiles`: Array of PDF file paths to process
- `outputDir`: Optional directory to save output files
- `combinedOutputFile`: Filename for the combined results (default: combinedOcrResult.json)
- `singleFileMode`: If true, only process the first PDF file (default: false)