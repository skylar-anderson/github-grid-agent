import { TextColumnType } from "./TextColumnType";
import { SelectColumnType } from "./Select";
import { SelectUserColumnType } from "./SelectUser";
import { FileColumnType } from "./FileColumnType";

export const columnTypes = {
  text: TextColumnType,
  select: SelectColumnType,
  "select-user": SelectUserColumnType,
  file: FileColumnType,
};

export type ColumnType = keyof typeof columnTypes;
