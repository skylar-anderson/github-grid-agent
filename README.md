# GitHub Grid Agent

A Next.js application for managing GitHub data in a customizable grid interface. Built with React, TypeScript, and GitHub's Octokit API.

## Features

- **Interactive Grid Interface**: Manage GitHub issues, pull requests, commits, and discussions in a spreadsheet-like view
- **Multiple Column Types**: Support for text, boolean, file, commit, issue/PR, and user selection columns
- **GitHub Integration**: Full integration with GitHub API for real-time data management
- **AI-Powered Functions**: Includes AI capabilities for code search, image analysis, and pull request walkthroughs
- **Customizable Views**: Create and save custom grid configurations for different workflows

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Components**: Primer React (GitHub's design system)
- **Styling**: Tailwind CSS
- **GitHub API**: Octokit
- **AI Integration**: Anthropic SDK, OpenAI
- **Testing**: Jest, React Testing Library

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
app/
├── columns/          # Column type implementations
├── components/       # React components
├── functions/        # GitHub API and AI functions
├── grid/            # Grid page routing
└── utils/           # Utility functions
```

## Key Components

- **Grid System**: Flexible grid component for displaying and editing GitHub data
- **Column Types**: Extensible column type system for different data formats
- **GitHub Functions**: Comprehensive set of functions for interacting with GitHub API
- **AI Functions**: Integration with AI services for enhanced functionality

## Testing

The project includes comprehensive test coverage for column types and components. Run tests with:

```bash
npm test
```

## License

Private project