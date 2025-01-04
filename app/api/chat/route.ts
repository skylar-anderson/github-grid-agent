import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

const columnParameters = z.object({
  title: z.string().min(1, 'Title is required').describe('The display name for the column. '),
  instructions: z
    .string()
    .describe(
      'Instructions for the AI agent that will populate the column. Include any specific formats, requirements, or context that will help ensure accurate data entry.'
    ),
  type: z.enum(['text', 'select', 'select-user', 'file']).describe(
    `The data type of the cells in the column.
              - Use 'text' for free text
              - Use 'select' a structured list of options
              - Use 'select-user' for a list of users
              - Use 'file' for a list of files on GitHub
              - Use 'boolean' for true/false values`
  ),
  options: z
    .array(
      z.object({
        title: z.string().describe('The name of the option. E.g. Bug'),
        description: z
          .string()
          .describe(
            'Additional context or explanation for this option. E.g. "A bug is a software issue that needs to be fixed." Provide instructions for the AI agent to use selecting this option.'
          ),
      })
    )
    .optional()
    .describe(
      'If options are provided, then the agent will only populate cells with values that are in the list of options. If you do not provide options, then the agent will automatically determine the options based on the data in the column. This can be tricky, so check with the user if you are unsure.'
    ),
  multiple: z
    .boolean()
    .default(false)
    .describe(
      'For select, select-user, and file types. Set to true if the user is requesting multiple items. '
    ),
});

export const toolParameters = {
  moveColumnLeft: z.object({
    index: z.number().describe('The index of the column to move.'),
  }),
  moveColumnRight: z.object({
    index: z.number().describe('The index of the column to move.'),
  }),
  groupColumns: z.object({
    index: z.number().describe('The index of the column to group.'),
  }),
  askForConfirmation: z.object({
    message: z.string().describe('The message to ask for confirmation.'),
  }),
  editColumn: columnParameters.extend({
    index: z.number().describe('The index of the column to edit.'),
  }),
  addColumn: columnParameters,
} as const;

// Export the inferred type
export type ToolParameters = {
  [K in keyof typeof toolParameters]: z.infer<(typeof toolParameters)[K]>;
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),
    maxSteps: 5,
    tools: {
      moveColumnLeft: {
        description: 'Move a column to the left.',
        parameters: toolParameters.moveColumnLeft,
      },
      moveColumnRight: {
        description: 'Move a column to the right.',
        parameters: toolParameters.moveColumnRight,
      },
      askForConfirmation: {
        description: 'Ask the user for confirmation...',
        parameters: toolParameters.askForConfirmation,
      },
      editColumn: {
        description: 'Edit an existing column.',
        parameters: toolParameters.editColumn,
      },
      addColumn: {
        description: 'Add a new column to the table...',
        parameters: toolParameters.addColumn,
      },
    },
  });

  return (await result).toDataStreamResponse();
}
