import { ReactNode } from 'react';
import { GridCell, Option, ColumnType, ColumnResponse } from '../actions';
import OpenAI from 'openai';

export interface BaseColumnType<T extends ColumnType> {
  type: T;
  formFields?: ({
    options,
    setOptions,
  }: {
    options: Option[];
    setOptions: (options: Option[]) => void;
  }) => ReactNode;
  renderCell: (cell: GridCell<T>) => ReactNode;
  generateResponseSchema: (
    options?: Option[],
    multiple?: boolean
  ) => OpenAI.ChatCompletionCreateParams['response_format'] | undefined;
  buildHydrationPrompt: (cell: GridCell<T>) => string;
  parseResponse: (responseContent: string, multiple?: boolean) => ColumnResponse[T];
}
