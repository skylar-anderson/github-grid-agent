import React from 'react';
import OpenAI from 'openai';
import { BaseColumnType } from './BaseColumnType';
import { GridCell, ColumnResponse } from '../actions';
import { Label, Box, Link } from '@primer/react';
import { GitCommitIcon } from '@primer/octicons-react';

function commitSchema(multiple: boolean): OpenAI.ChatCompletionCreateParams['response_format'] {
  return {
    type: 'json_schema',
    json_schema: {
      name: 'commit_response',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          [multiple ? 'commits' : 'commit']: multiple
            ? {
                type: 'array',
                description:
                  'The commits that you have selected. If there are no clear commits to select, use an empty array',
                items: {
                  type: 'object',
                  properties: {
                    sha: { type: 'string' },
                    repository: { type: 'string' },
                    message: { type: 'string' },
                  },
                  required: ['sha', 'repository'],
                  additionalProperties: false,
                },
              }
            : {
                type: 'object',
                description:
                  'The commit that you have selected. If there is no clear commit to select, use null',
                properties: {
                  sha: { type: 'string' },
                  repository: { type: 'string' },
                  message: { type: 'string' },
                },
                required: ['sha', 'repository'],
                additionalProperties: false,
              },
        },
        required: [multiple ? 'commits' : 'commit'],
        additionalProperties: false,
      },
    },
  };
}

function Commit({
  commit,
}: {
  commit: {
    sha: string;
    repository: string;
    message?: string;
  };
}) {
  const shortSha = commit.sha.slice(0, 7);
  const url = `https://github.com/${commit.repository}/commit/${commit.sha}`;

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <Label>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GitCommitIcon size={14} />
          <Box>
            {commit.repository}@{shortSha}
            {commit.message && (
              <Box sx={{ color: 'fg.muted', display: 'inline' }}> - {commit.message}</Box>
            )}
          </Box>
        </Box>
      </Label>
    </Link>
  );
}

export const CommitColumnType: BaseColumnType<'commit'> = {
  type: 'commit',
  renderCell: (cell: GridCell<'commit'>) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {'commits' in cell.response && cell.response.commits ? (
        cell.response.commits.length > 0 ? (
          cell.response.commits.map((commit, index) => <Commit commit={commit} key={index} />)
        ) : (
          <>No commits selected</>
        )
      ) : cell.response.commit ? (
        <Commit commit={cell.response.commit} />
      ) : (
        <>No commit selected</>
      )}
    </Box>
  ),
  generateResponseSchema: (_, multiple?: boolean) => commitSchema(multiple || false),
  buildHydrationPrompt: (cell: GridCell<'commit'>) =>
    `Select ${cell.multiple ? 'commits' : 'a commit'}: Select ${
      cell.multiple ? 'multiple commits' : 'a commit'
    } and reply with their SHA, repository, and optionally the commit message`,
  parseResponse: (responseContent: string, multiple?: boolean): ColumnResponse['commit'] => {
    const parsed = JSON.parse(responseContent);
    return multiple ? { commits: parsed.commits } : { commit: parsed.commit };
  },
};
