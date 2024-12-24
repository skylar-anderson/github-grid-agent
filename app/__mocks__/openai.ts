class OpenAIClass {
  constructor() {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'Mock response',
                  role: 'assistant',
                },
              },
            ],
          }),
        },
      },
    };
  }
}

// Export as default to match the import in actions.ts
export default OpenAIClass;
