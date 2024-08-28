import { TextColumnType } from "./TextColumnType";
import { SelectColumnType } from "./Select";
import { SelectUserColumnType } from "./SelectUser";
import { SelectFileColumnType } from "./SelectFile"

export const columnTypes = {
  text: TextColumnType,
  select: SelectColumnType,
  "select-user": SelectUserColumnType,
  "select-file": SelectFileColumnType, // Add the new column type
};

export type ColumnType = keyof typeof columnTypes;