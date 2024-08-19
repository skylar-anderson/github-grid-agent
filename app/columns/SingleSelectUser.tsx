import OpenAI from 'openai';
import { BaseColumnType } from './BaseColumnType';
import { SingleSelectUserResponse, SingleSelectUserCell } from '../actions';
import { Box, Avatar } from '@primer/react';

const singleSelectUserSchema:OpenAI.ChatCompletionCreateParams["response_format"] = {
  type: "json_schema",
  json_schema: {
    name: "single_select_user_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        user: {
          type: "string",
          description: 'The handle of the user that you have selected. If there is no clear user to select, use the string "no-user"',
        },
      },
      required: ["user"],
      additionalProperties: false,
    },
  },
}

const avatarUrl = (handle: string, size: number = 200) => `https://github.com/${handle}.png?size=${size}`;

function User({ handle }: { handle: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar src={avatarUrl(handle)} size={24} />
      <Box sx={{ fontWeight: 'semibold', color: 'fg.default' }}>{handle}</Box>
    </Box>
  );
}

export const SingleSelectUserColumnType: BaseColumnType<SingleSelectUserResponse> = {
  type: 'single-select-user',
  renderCell: (cell: SingleSelectUserCell) => 
    cell.response.user === 'no-user' ? (
      <>No user selected</>
    ) : (
      <User handle={cell.response.user} />
    ),
    generateResponseSchema: () => singleSelectUserSchema,
  buildHydrationPrompt: () => 'Select a user: Select a user and reply only with their handle',
};