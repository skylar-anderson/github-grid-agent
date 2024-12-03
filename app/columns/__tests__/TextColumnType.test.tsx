import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextColumnType } from '../TextColumnType';
import { GridCell } from '../../actions';

describe('TextColumnType', () => {
  const baseCell = {
    columnTitle: "Test Column",
    columnInstructions: "Test instructions",
    context: "",
    hydrationSources: [],
  };

  describe('renderCell', () => {
    it('renders markdown text correctly', () => {
      const cell: GridCell<"text"> = {
        ...baseCell,
        columnType: "text",
        state: "done",
        response: "This is **bold** text",
        multiple: false
      };

      const { container } = render(<>{TextColumnType.renderCell(cell)}</>);
      expect(container).toHaveTextContent('This is **bold** text');
    });

    it('renders empty string when response is empty', () => {
      const cell: GridCell<"text"> = {
        ...baseCell,
        columnType: "text",
        state: "done",
        response: "",
        multiple: false
      };

      const { container } = render(<>{TextColumnType.renderCell(cell)}</>);
      expect(container).toHaveTextContent('');
    });
  });

  describe('generateResponseSchema', () => {
    it('returns undefined as text columns do not use JSON schema', () => {
      const schema = TextColumnType.generateResponseSchema();
      expect(schema).toBeUndefined();
    });
  });

  describe('parseResponse', () => {
    it('returns the raw text response', () => {
      const response = TextColumnType.parseResponse('Some markdown text');
      expect(response).toBe('Some markdown text');
    });
  });
}); 