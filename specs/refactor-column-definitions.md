When adding columns to the grid, users can select a column type. The column type is used in numerous places throughout the codebase to

1. Determine the contents of the new column form
2. Determine what schema in `schemas.ts` should be used to hydrate cells in `actions.ts`
3. Determine how to render the contents of `Cell.tsx`
4. Column type is selected by users in side `NewColumnForm.tsx` inside the select element.

The scattering of this logic makes it difficult and error prone to add new or edit existing column types.

Your task is to refactor the current codebase to make it easier to manage column types. I'd like you to create a new directory called "columns" where we can create a single file for each column type. The column type file encapsulates all of the logic necessary to make the column work within the grid (See the list above for examples).

After this refactor is complete, adding new columns should be as simple as creating a new column type file that matches the pattern of other column type files.

In a later session, we'll add more logic to the column type files, such as 1) How to sort by the column 2) How to filter by the column, 3) And more.
