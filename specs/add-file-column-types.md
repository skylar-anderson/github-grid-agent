# New feature: File and File List column types

## Requirements

### Review of current behavior

Right now, when adding new columns to the grid, users can choose from a number of different column types (test, single-select, multi-select, etc...). Column types are used to dictate a few things:

1. What form UI is shown when adding the column
2. How cells are rendered within the column
3. What prompting is provided to the model in `actions.ts`

You can find these scenaiors throughout the code anywhere we check columnType

### Proposed new behavior

Introduce two new column types:

1. File - Represents a single file
2. File List - Represents a list of files

Files are defined by two properties:

- `path` - The path to the file
- `repository` - The repository the file belongs to

When rendering files, combine the `path` and `repository` properties to create a link to the file in the repository.

These column types behave similarly to User and User list, however when they are rendered, they will use a File Octicon instead of a user avatar. Please be compehensive in how you implement this feature and make sure that everywhere we conditionally check columnType includes these new column types.
