import { ReactNode } from 'react';
import { GridCellBase, Option, ColumnResponse } from '../actions';
import OpenAI from 'openai';

export interface BaseColumnType<T extends ColumnResponse> {
  type: string;
  formFields?: ({ options, setOptions }: { options: Option[], setOptions: (options: Option[]) => void }) => ReactNode;
  renderCell: (cell: GridCellBase<T>) => ReactNode;
  generateResponseSchema: (options?: Option[]) => OpenAI.ChatCompletionCreateParams["response_format"] | undefined;
  buildHydrationPrompt: (cell: GridCellBase<T>) => string;
}