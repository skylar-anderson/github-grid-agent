import { TextColumnType } from "./TextColumnType";
import { SelectColumnType } from "./Select";
import { SelectUserColumnType } from "./SelectUser";
import { FileColumnType } from "./FileColumnType";
import { BooleanColumnType } from "./BooleanColumnType";
import { IssuePRColumnType } from "./IssuePRColumnType";
import { CommitColumnType } from "./CommitColumnType";

export const columnTypes = {
  text: TextColumnType,
  select: SelectColumnType,
  "select-user": SelectUserColumnType,
  file: FileColumnType,
  boolean: BooleanColumnType,
  "issue-pr": IssuePRColumnType,
  commit: CommitColumnType,
};

export type ColumnType = keyof typeof columnTypes;
