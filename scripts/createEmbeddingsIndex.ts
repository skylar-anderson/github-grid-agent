import fs from 'fs/promises';
import simpleGit from 'simple-git';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import * as matter from 'gray-matter';
import { glob } from 'glob';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import pThrottle from 'p-throttle';

export const indexedRepositories = {
  'primer/design': 'main',
  'primer/react': 'main',
  'skylar-anderson/openai-chat-playground': 'main',
  'skylar-anderson/github-grid-agent': 'main',
  'vercel/ai': 'main',
};

const CHUNK_SIZES = {
  md: 800,
  js: 800,
  config: 512,
};

const CHUNK_OVERLAPS = {
  md: 200,
  js: 200,
  config: 100,
};

const splitters = {
  md: RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize: CHUNK_SIZES.md,
    chunkOverlap: CHUNK_OVERLAPS.md,
  }),
  js: RecursiveCharacterTextSplitter.fromLanguage('js', {
    chunkSize: CHUNK_SIZES.js,
    chunkOverlap: CHUNK_OVERLAPS.js,
  }),
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type EmbedProps = {
  type: 'js' | 'markdown';
  repo: string;
  owner: string;
  sha: string;
  ref: string;
  fileContent: string;
  filePath: string;
};

type ChunkContext = {
  title: string;
  path: string;
  type: string;
  section?: string;
};

const generateChunkSummary = async (content: string, context: ChunkContext): Promise<string> => {
  try {
    const prompt = `Given this ${context.type} content from ${context.path}:

${content}

Generate a brief (1-2 sentences) technical summary that describes what this code/content does. 
Focus on the key functionality, purpose, or main points.
If this is code, describe its technical function.
If this is markdown, summarize the main topic.
Be concise and specific.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const summary = completion.choices[0].message.content || '';
    return `File: ${context.path}
Type: ${context.type}
${context.section ? `Section: ${context.section}\n` : ''}
Summary: ${summary}

Content:
${content}`;
  } catch (error) {
    console.error('Error generating chunk context:', error);
    return `This is a ${context.type} chunk from ${context.path}${
      context.section ? ` in the ${context.section} section` : ''
    }. ${content}`;
  }
};

// Throttle to 20 requests per minute
const generateChunkContext = pThrottle({
  limit: 20,
  interval: 60000,
})(generateChunkSummary);

async function embedFile({
  type,
  repo,
  owner,
  fileContent,
  filePath,
  sha,
  ref,
}: EmbedProps): Promise<void> {
  let result;
  let content = fileContent;
  let title = filePath.split('/').pop();

  if (type === 'js') {
    result = await splitters.js.createDocuments([content]);
  } else if (type === 'markdown') {
    const { data, content } = matter.default(fileContent);
    result = await splitters.md.createDocuments([content]);
    if (data.title) {
      title = data.title;
    }
  } else {
    throw new Error('unsupported type');
  }

  for (let i = 0; i < result.length; i++) {
    const document = result[i];
    const chunk = document.pageContent;
    console.log('starting...', filePath, `chunk ${i + 1} of ${result.length}`);

    const contextualizedChunk = await generateChunkContext(chunk, {
      title: title || '',
      path: filePath,
      type,
      section: document.metadata?.section,
    });

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: contextualizedChunk,
    });

    const [{ embedding }] = embeddingResponse.data;
    const { data, error } = await supabase
      .from('search_index')
      .insert({
        title,
        path: filePath,
        ref,
        owner,
        sha,
        repo,
        handle: [owner, repo].join('/'),
        chunk: contextualizedChunk,
        content,
        embedding,
      })
      .select('*');

    if (error) {
      console.log('error', error);
    } else {
      console.log('saved', filePath, i);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

async function embedRepo(owner: string, repo: string, ref: string) {
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  const checkoutPath = `./tmp-${Date.now()}-${owner}-${repo}`;

  console.log(`Cloning ${repo} into ${checkoutPath}...`);
  const git = simpleGit();
  await git.clone(cloneUrl, checkoutPath, ['--depth', '1']);
  await git.cwd(checkoutPath);
  const sha = await git.revparse([ref]);

  console.log(`Clone complete...`);
  console.log(`Embedding content in ${checkoutPath}...`);
  console.log(`With sha: ${ref}:${sha}...`);

  const mdfiles = await glob(`${checkoutPath}/**/*.{md,mdx}`);
  const jsfiles = await glob(`${checkoutPath}/**/*.{js,jsx,ts,tsx}`);

  try {
    await Promise.all(
      jsfiles.map(async (filePath) => {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const relativeFilePath = filePath.replace(checkoutPath.replace('./', ''), '');
        await embedFile({
          type: 'js',
          repo,
          owner,
          sha,
          fileContent,
          filePath: relativeFilePath,
          ref,
        });
      })
    );
    await Promise.all(
      mdfiles.map(async (filePath) => {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const relativeFilePath = filePath.replace(checkoutPath.replace('./', ''), '');

        await embedFile({
          type: 'markdown',
          repo,
          owner,
          sha,
          fileContent,
          filePath: relativeFilePath,
          ref,
        });
      })
    );
  } catch (err) {
    console.error(`Error in embedRepoContent:`, err);
  }

  console.log(`Embedding complete...`);
}

async function main() {
  Object.entries(indexedRepositories).forEach(([repo, ref]) => {
    const [org, repoName] = repo.split('/');
    embedRepo(org, repoName, ref);
  });
}

main();
