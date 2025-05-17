# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OCR (Optical Character Recognition) tool built with TypeScript that uses the Mistral AI API to process PDF documents. The application can:

1. Process individual PDF files for OCR
2. Combine OCR results from multiple files
3. Save OCR results as JSON files

## Environment Setup

The project requires a `.env` file in the root directory with the following variables:
```
MISTRAL_API_KEY=your_mistral_api_key_here
```

## Commands

### Build and Run
```
npm run ocr
```
This command compiles the TypeScript code and runs the OCR process on the PDF files specified in the `main()` function.

### TypeScript Compilation
```
tsc
```
Compiles the TypeScript code to JavaScript in the `/dist` directory.

### Run Compiled Code
```
node dist/index.js
```
Executes the compiled JavaScript code.

## Project Structure

- `src/index.ts` - Main application file containing all the OCR processing logic
- Files are output to the current working directory:
  - Individual OCR results: `ocr_filename.json`
  - Combined results: `combinedOcrResult.json`

## Important Notes

1. PDF files to process are defined in the `pdfFiles` array in the `main()` function
2. The application uses the Mistral AI API for OCR processing
3. The project uses environment variables for API authentication
4. OCR results are saved as JSON files in the project root

## Development Workflow

1. Update the list of PDF files to process in the `main()` function
2. Make sure the PDF files are in the correct location (default: project root)
3. Run `npm run ocr` to process the files
4. Check the generated JSON files for OCR results