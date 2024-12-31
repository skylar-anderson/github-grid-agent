import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),
    maxSteps: 5,
    tools: {
      getLocation: {
        description: 'Get the user location. Always ask for confirmation before using this tool.',
        parameters: z.object({}),
      },
      askForConfirmation: {
        description:
          'Ask the user for confirmation. Always call this tool before calling other tools. Present the name of tool and the arguments to the user.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
      addColumn: {
        description:
          'Add a new column to the table. The cells of the column will be populated be a separate AI agent based on the instructions provided. Before calling this tool, you should call askForConfirmation to ensure the user wants to add the column.',
        parameters: z.object({
          title: z
            .string()
            .min(1, 'Title is required')
            .describe('The display name for the column. '),
          instructions: z
            .string()
            .describe(
              'Instructions for the AI agent that will populate the column. Include any specific formats, requirements, or context that will help ensure accurate data entry.'
            ),
          type: z.enum(['text', 'select', 'select-user', 'file', 'boolean']).describe(
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
                    'Additional context or explanation for this option. E.g. "A bug is a software issue that needs to be fixed."'
                  ),
              })
            )
            .optional()
            .describe(
              'If options are provided, then the agent will only populate cells with values that are in the list of options. If you do not provide options, then the agent will automatically determine the options based on the data in the column. This can be tricky, so check with the user if you are unsure.'
            ),
          multiple: z
            .boolean()
            .optional()
            .describe(
              'For select, select-user, and file types. Set to true if the user is requesting multiple items. '
            ),
        }),
      },
    },
  });

  return (await result).toDataStreamResponse();
}
