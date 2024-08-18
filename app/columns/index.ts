import { TextColumnType } from './TextColumnType';
import { SingleSelectColumnType } from './SingleSelectColumnType';
import { MultiSelectColumnType } from './MultiSelectColumnType';
import { SingleSelectUserColumnType } from './SingleSelectUserColumnType';
import { MultiSelectUserColumnType } from './MultiSelectUserColumnType';

export const columnTypes = {
  text: TextColumnType,
  'single-select': SingleSelectColumnType,
  'multi-select': MultiSelectColumnType,
  'single-select-user': SingleSelectUserColumnType,
  'multi-select-user': MultiSelectUserColumnType,
};

export type ColumnType = keyof typeof columnTypes;