import { TextColumnType } from "./TextColumnType";
import { SingleSelectColumnType } from "./SingleSelect";
import { MultiSelectColumnType } from "./MultiSelect";
import { SingleSelectUserColumnType } from "./SingleSelectUser";
import { MultiSelectUserColumnType } from "./MultiSelectUser";

export const columnTypes = {
  text: TextColumnType,
  "single-select": SingleSelectColumnType,
  "multi-select": MultiSelectColumnType,
  "single-select-user": SingleSelectUserColumnType,
  "multi-select-user": MultiSelectUserColumnType,
};

export type ColumnType = keyof typeof columnTypes;
