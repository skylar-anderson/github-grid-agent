import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileColumnType } from '../FileColumnType';
import { GridCell } from '../../actions';

describe('FileColumnType', () => {
  const baseCell = {
    columnTitle: "Test Column",
    columnInstructions: "Test instructions",
    context: "",
    hydrationSources: [],
  };

  describe('renderCell', () => {
    it('renders single file correctly', () => {
      const cell: GridCell<"file"> = {
        ...baseCell,
        columnType: "file",
        state: "done",
        response: {
          file: {
            path: "src/index.ts",
            repository: "owner/repo"
          }
        },
        multiple: false
      };

      render(<>{FileColumnType.renderCell(cell)}</>);
      expect(screen.getByText('File:')).toBeInTheDocument();
      expect(screen.getByText('index.ts')).toBeInTheDocument();
    });

    it('renders multiple files correctly', () => {
      const cell: GridCell<"file"> = {
        ...baseCell,
        columnType: "file",
        state: "done",
        response: {
          files: [
            {
              path: "src/index.ts",
              repository: "owner/repo"
            },
            {
              path: "src/types.ts",
              repository: "owner/repo"
            }
          ]
        },
        multiple: true
      };

      render(<>{FileColumnType.renderCell(cell)}</>);
      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.getByText('types.ts')).toBeInTheDocument();
    });

    it('renders no selection message when empty', () => {
      const cell: GridCell<"file"> = {
        ...baseCell,
        columnType: "file",
        state: "done",
        response: { files: [] },
        multiple: true
      };

      render(<>{FileColumnType.renderCell(cell)}</>);
      expect(screen.getByText('No files selected')).toBeInTheDocument();
    });
  });

  describe('generateResponseSchema', () => {
    it('returns correct schema for single selection', () => {
      const schema = FileColumnType.generateResponseSchema(undefined, false);
      expect(schema?.json_schema.schema.properties).toHaveProperty('file');
    });

    it('returns correct schema for multiple selection', () => {
      const schema = FileColumnType.generateResponseSchema(undefined, true);
      expect(schema?.json_schema.schema.properties).toHaveProperty('files');
    });
  });

  describe('parseResponse', () => {
    it('parses single file response correctly', () => {
      const response = FileColumnType.parseResponse(
        JSON.stringify({
          file: {
            path: "src/index.ts",
            repository: "owner/repo"
          }
        }),
        false
      );
      expect(response).toEqual({
        file: {
          path: "src/index.ts",
          repository: "owner/repo"
        }
      });
    });

    it('parses multiple files response correctly', () => {
      const response = FileColumnType.parseResponse(
        JSON.stringify({
          files: [{
            path: "src/index.ts",
            repository: "owner/repo"
          }]
        }),
        true
      );
      expect(response).toEqual({
        files: [{
          path: "src/index.ts",
          repository: "owner/repo"
        }]
      });
    });
  });
}); 