# Architecture Overview

This OCR application has been refactored following SOLID principles and clean architecture patterns to improve testability, maintainability, and extensibility.

## Key Design Principles

### 1. Single Responsibility Principle (SRP)
Each class has a single, well-defined responsibility:
- `FileService`: File system operations
- `MistralOcrProvider`: OCR processing with Mistral AI
- `ResultAggregator`: Combining OCR results
- `PdfProcessor`: Processing individual PDF files
- `CliHandler`: Command-line interface logic
- `OcrOrchestrator`: Coordinating the overall workflow

### 2. Open/Closed Principle (OCP)
The system is open for extension through interfaces:
- New OCR providers can be added by implementing `IOcrProvider`
- Different file storage mechanisms can be added by implementing `IFileService`
- New output formats can be added by implementing `IResultWriter`

### 3. Liskov Substitution Principle (LSP)
All implementations can be substituted for their interfaces without breaking functionality.

### 4. Interface Segregation Principle (ISP)
Interfaces are focused and specific:
- `IOcrProvider`: OCR operations only
- `IFileService`: File operations only
- `IResultAggregator`: Result combination only

### 5. Dependency Inversion Principle (DIP)
High-level modules depend on abstractions (interfaces) rather than concrete implementations.

## Directory Structure

```
src/
├── interfaces/        # All interfaces (contracts)
├── models/           # Data models
├── services/         # Business logic implementations
├── config/           # Configuration management
├── cli/              # CLI-specific code
├── container/        # Dependency injection
├── api.ts           # Public API exports
└── index.ts         # CLI entry point
```

## Testing

The refactored architecture makes testing straightforward:

1. **Unit Testing**: Each service can be tested in isolation using mock implementations of its dependencies
2. **Integration Testing**: The container can be configured with test implementations
3. **Mocking**: All dependencies are injected through interfaces, making mocking trivial

Example test structure:
```
tests/
├── services/         # Service unit tests
├── cli/             # CLI unit tests
└── integration/     # Integration tests
```

## Extending the Application

### Adding a New OCR Provider
1. Create a new class implementing `IOcrProvider`
2. Update the container to use the new provider
3. No other code changes required

### Adding a New Output Format
1. Create a new implementation of `IResultWriter`
2. Update the container or make it configurable
3. The rest of the application remains unchanged

### Adding New Commands
1. Extend the `CliHandler` to parse new options
2. Add new methods to the `OcrOrchestrator` if needed
3. Update the main entry point

## Benefits of This Architecture

1. **Testability**: Every component can be tested in isolation
2. **Maintainability**: Clear separation of concerns makes code easier to understand and modify
3. **Extensibility**: New features can be added without modifying existing code
4. **Flexibility**: Components can be easily swapped out or replaced
5. **Type Safety**: TypeScript interfaces provide compile-time guarantees