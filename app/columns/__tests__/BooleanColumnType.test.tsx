import React from 'react';
import { render, screen } from '@testing-library/react';
import { BooleanColumnType } from '../BooleanColumnType';
import { GridCell } from '../../actions';

describe('BooleanColumnType', () => {
  describe('renderCell', () => {
    const baseCell = {
      columnTitle: "Test Column",
      columnInstructions: "Test instructions",
      context: "",
      hydrationSources: [],
    };

    it('renders true value correctly', () => {
      const cell: GridCell<"boolean"> = {
        ...baseCell,
        columnType: "boolean",
        state: "done",
        response: { value: true },
        multiple: false
      };

      render(<>{BooleanColumnType.renderCell(cell)}</>);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('renders false value correctly', () => {
      const cell: GridCell<"boolean"> = {
        ...baseCell,
        columnType: "boolean",
        state: "done",
        response: { value: false },
        multiple: false
      };

      render(<>{BooleanColumnType.renderCell(cell)}</>);
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  describe('generateResponseSchema', () => {
    it('returns correct schema', () => {
      const schema = BooleanColumnType.generateResponseSchema();
      expect(schema).toEqual({
        type: "json_schema",
        json_schema: {
          name: "boolean_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              value: {
                type: "boolean",
                description: "The boolean value (true or false) for this cell",
              },
            },
            required: ["value"],
            additionalProperties: false,
          },
        },
      });
    });
  });

  describe('parseResponse', () => {
    it('parses true response correctly', () => {
      const response = BooleanColumnType.parseResponse('{"value": true}');
      expect(response).toEqual({ value: true });
    });

    it('parses false response correctly', () => {
      const response = BooleanColumnType.parseResponse('{"value": false}');
      expect(response).toEqual({ value: false });
    });

    it('throws error on invalid JSON', () => {
      expect(() => BooleanColumnType.parseResponse('invalid')).toThrow();
    });
  });
}); 