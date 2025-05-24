# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OCR (Optical Character Recognition) tool built with TypeScript that uses the Mistral AI API to process PDF documents. The application can:

1. Process individual PDF files for OCR
2. Combine OCR results from multiple files
3. Save OCR results as JSON files with customizable output locations

## Environment Setup

The project requires a `.env` file in the root directory with the following variable:
```
MISTRAL_API_KEY=your_mistral_api_key_here
```

## Commands

### Command-Line Options
```
npm run ocr -- [options] [file(s)]
```

Options:
- `-o, --output <file>`: Specify the output filename (default: "result.json")
- `-h, --help`: Display help information

Note: The `--` separator is required when using npm scripts to pass arguments to the script itself.

### Process Specific PDF Files
```
npm run ocr -- file1.pdf file2.pdf
```
or
```
node dist/index.js file1.pdf file2.pdf
```
Process specific PDF files passed as command-line arguments.

### Using Wildcard Patterns
You can use glob patterns to process multiple PDF files:
```
npm run ocr -- "documents/*.pdf"
npm run ocr -- reports/2023/*.pdf presentations/2023/*.pdf
```

### Specifying Output Filename
```
npm run ocr -- --output results.json file1.pdf
npm run ocr -- -o report_results.json file1.pdf file2.pdf
```

### TypeScript Compilation
```
tsc
```
Compiles the TypeScript code to JavaScript in the `/dist` directory.

## Project Structure

- `src/index.ts` - Main application file containing all the OCR processing logic
- Files are output to the current working directory:
  - Individual OCR results: `ocr_filename.json`
  - Combined results: Customizable (default: `result.json`)

## Important Notes

1. PDF files can be specified as command-line arguments or glob patterns (e.g., "*.pdf")
2. The application uses the Mistral AI API for OCR processing
3. Output filename is customizable via command-line option (-o or --output)
4. Default output filename is "result.json" if not specified
5. All output files are saved in the current working directory
6. OCR results are saved as JSON files

## Development Workflow

1. Define PDF files to process via command-line arguments or glob patterns
2. Optionally specify output filename with the `-o` or `--output` option
3. Run `npm run ocr -- [options] [files]` to process the files
4. Check the generated JSON files in the current directory

## API Usage

The project exposes a `processOcr` function with the following parameters:

```typescript
processOcr(
  pdfFiles: string[], 
  outputDir: string = process.cwd(), 
  combinedOutputFile: string = 'result.json',
  singleFileMode: boolean = false
): Promise<void>
```
- `pdfFiles`: Array of PDF file paths to process
- `outputDir`: Directory to save output files (default: current working directory)
- `combinedOutputFile`: Filename for the combined results (default: result.json)
- `singleFileMode`: If true, only process the first PDF file (default: false)

## Workflow Memories

- commit every meaningful change, to gradually implement required feature
- run tests before every commit, so commited code should always pass tests
- always end files with new line
- every product improvement should start from feature branch and end in pr
- before commiting: always check if readme need to be updated based on changes