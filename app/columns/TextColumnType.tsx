import React from 'react';
import { BaseColumnType } from './BaseColumnType';
import { ColumnResponse, GridCell } from '../actions';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const TextColumnType: BaseColumnType<'text'> = {
  type: 'text',
  renderCell: (cell: GridCell<'text'>) => (
    <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
      {cell.response}
    </Markdown>
  ),
  generateResponseSchema: () => undefined,
  buildHydrationPrompt: () =>
    'Text: reply with a markdown string containing the answer. Avoid using markdown headings.',
  parseResponse: (responseContent: string): ColumnResponse['text'] => {
    return responseContent;
  },
};
