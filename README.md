# OCR Tool

A TypeScript-based OCR (Optical Character Recognition) tool that processes PDF files using the Mistral AI API. This tool can extract text from PDFs, process multiple files at once, and save results as JSON files.

## Features

- 📄 Process individual or multiple PDF files
- 🤖 OCR processing using Mistral AI API
- 📁 Support for glob patterns to process multiple files
- 💾 Save individual and combined results as JSON
- 🏗️ Clean architecture with dependency injection
- ✅ Comprehensive test coverage
- 🔧 Command-line interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Mistral AI API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ocr
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
```

## Usage

### Basic Usage

Process a single PDF file:
```bash
npm run ocr -- sample.pdf
```

Process multiple PDF files:
```bash
npm run ocr -- file1.pdf file2.pdf file3.pdf
```

### Using Glob Patterns

Process all PDFs in a directory:
```bash
npm run ocr -- "documents/*.pdf"
```

Process PDFs from multiple directories:
```bash
npm run ocr -- "reports/2023/*.pdf" "presentations/2023/*.pdf"
```

### Custom Output Filename

Specify a custom output filename:
```bash
npm run ocr -- --output results.json file1.pdf
npm run ocr -- -o report_results.json "docs/*.pdf"
```

### Command-Line Options

- `-o, --output <file>`: Specify the output filename (default: "result.json")
- `-h, --help`: Display help information

## Output

The tool generates two types of output files:

1. **Individual OCR results**: Each processed PDF gets its own JSON file named `ocr_<original_filename>.json`
2. **Combined results**: All OCR results are combined into a single file (default: `result.json` or custom name via `-o` option)

All output files are saved in the current working directory.

## Architecture

The project follows SOLID principles and clean architecture:

- **Container**: Dependency injection container managing all services
- **CliHandler**: Command-line interface parsing and validation
- **Configuration**: Environment variable management
- **FileService**: File system operations
- **MistralOcrProvider**: OCR processing using Mistral AI
- **PatternMatcher**: Glob pattern expansion
- **PdfProcessor**: Processing individual PDF files
- **ResultAggregator**: Combining multiple OCR results
- **ResultWriter**: Writing results to JSON files
- **OcrOrchestrator**: Coordinating the overall workflow

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Development

### Building the Project

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Project Structure

```
ocr/
├── src/
│   ├── api.ts              # API exports
│   ├── index.ts            # CLI entry point
│   ├── cli/                # Command-line interface
│   ├── config/             # Configuration management
│   ├── container/          # Dependency injection
│   ├── interfaces/         # TypeScript interfaces
│   ├── models/             # Data models
│   └── services/           # Core services
├── tests/                  # Test files
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env                    # Environment variables (create this)
```

## API Usage

The project also exposes a programmatic API:

```typescript
import { processOcr } from 'ocr';

await processOcr(
  ['file1.pdf', 'file2.pdf'],           // PDF files to process
  process.cwd(),                        // Output directory (optional)
  'result.json',                        // Combined output filename (optional)
  false                                 // Single file mode (optional)
);
```

## Contributing

Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to contribute to this project.

## License

[License information here]

## Support

For issues and feature requests, please use the GitHub issue tracker.