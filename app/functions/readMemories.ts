import { getMemory } from '@/app/utils/github';
import OpenAI from 'openai';

const meta: OpenAI.FunctionDefinition = {
  name: 'readMemories',
  description: `This function retrieves all memories that have been saved so far. You can use this to remind yourself of what you've learned about the user so far.`,
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

async function run(): Promise<string> {
  return getMemory();
}

export default { run, meta };
