import { githubApiRequest } from '@/app/utils/github';
import { Endpoints } from '@octokit/types';
import OpenAI from 'openai';
import readMemories from './readMemories';
const ENDPOINT = 'PATCH /gists/{gist_id}';

const meta: OpenAI.FunctionDefinition = {
  name: 'addMemory',
  description: `Whenever the user says something interesting that helps you better understand their preferences, character, or personality, save it as a memory. In future conversations, you will be able to read these memories, so ensure you only write memories that actually help you better serve the user in the future.`,
  parameters: {
    type: 'object',
    properties: {
      memory: {
        type: 'string',
        description:
          'Required. The contents of the new memory to save. This will be appended to the existing memory file. Conserve space by being concise and only saving memories that will be useful in the future.',
      },
    },
    required: ['memory'],
  },
};

const GIST_ID = process.env.MEMORY_GIST_ID;
const file = 'memory.txt';

async function run(memory: string) {
  type GetGistResponse = Endpoints[typeof ENDPOINT]['response'] | undefined;
  const currentMemory = await readMemories.run();
  try {
    const response = await githubApiRequest<GetGistResponse>(ENDPOINT, {
      gist_id: GIST_ID,
      description: 'Copilot wrote a new memory',
      files: {
        [file]: {
          content: `${currentMemory}\n${memory}`,
        },
      },
    });
    if (response?.status !== 200) {
      return 'Error saving memory';
    }
    return 'Memory saved';
  } catch (error) {
    console.log('Failed to fetch memory!');
    console.log(error);
    return 'An error occured when trying to fetch memory.';
  }
}

const addMemoryFunction = { run, meta };
export default addMemoryFunction;
