import { BaseColumnType } from './BaseColumnType';
import { TextCell, TextResponse } from '../actions';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const TextColumnType: BaseColumnType<TextResponse> = {
  type: 'text',
  renderCell: (cell) => (
    <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
      {cell.response}
    </Markdown>
  ),
  generateResponseSchema: () => undefined,
  buildHydrationPrompt: () => 
    'Text: reply with a markdown string containing the answer. Avoid using markdown headings.',
};