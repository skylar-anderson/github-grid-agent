import { TextColumnType } from "./TextColumnType";
import { SelectColumnType } from "./Select";
import { SelectUserColumnType } from "./SelectUser";

export const columnTypes = {
  text: TextColumnType,
  select: SelectColumnType,
  "select-user": SelectUserColumnType,
};

export type ColumnType = keyof typeof columnTypes;
