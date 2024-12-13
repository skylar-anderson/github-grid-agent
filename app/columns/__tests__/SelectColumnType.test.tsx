import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectColumnType } from '../Select';
import { GridCell } from '../../actions';
import { baseCell } from './test-types';

const options = [
  { value: 'Option 1', title: 'Option 1', description: 'Option 1' },
  { value: 'Option 2', title: 'Option 2', description: 'Option 2' },
  { value: 'Option 3', title: 'Option 3', description: 'Option 3' },
];

describe('SelectColumnType', () => {
  describe('renderCell', () => {
    it('renders single selection correctly', () => {
      const cell: GridCell<'select'> = {
        ...baseCell,
        columnType: 'select',
        state: 'done',
        response: { option: 'Option 1' },
        multiple: false,
        options,
      };

      render(<>{SelectColumnType.renderCell(cell)}</>);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders multiple selections correctly', () => {
      const cell: GridCell<'select'> = {
        ...baseCell,
        columnType: 'select',
        state: 'done',
        response: { options: ['Option 1', 'Option 2'] },
        multiple: true,
        options,
      };

      render(<>{SelectColumnType.renderCell(cell)}</>);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('renders no selection message when empty', () => {
      const cell: GridCell<'select'> = {
        ...baseCell,
        columnType: 'select',
        state: 'done',
        response: { options: [] },
        multiple: true,
        options,
      };

      render(<>{SelectColumnType.renderCell(cell)}</>);
      expect(screen.getByText('No options selected')).toBeInTheDocument();
    });
  });

  describe('generateResponseSchema', () => {
    it('returns correct schema for single selection', () => {
      const schema = SelectColumnType.generateResponseSchema(options, false);
      if (schema?.type !== 'json_schema') throw new Error('Expected JSON schema');
      expect((schema.json_schema as any)?.schema?.properties.option).toEqual({
        type: 'string',
        description: 'Select a single option that best fits the response',
        enum: options.map((option) => option.value),
      });
    });

    it('returns correct schema for multiple selection', () => {
      const schema = SelectColumnType.generateResponseSchema(options, true);
      if (schema?.type !== 'json_schema') throw new Error('Expected JSON schema');
      expect((schema.json_schema as any)?.schema?.properties.options).toEqual({
        type: 'array',
        description:
          'Select the options that you would like to include in the response. If no options are relevant, select "N/A"',
        items: {
          type: 'string',
          enum: ['N/A', ...options.map((option) => option.value)],
        },
      });
    });
  });

  describe('parseResponse', () => {
    it('parses single selection response correctly', () => {
      const response = SelectColumnType.parseResponse(
        JSON.stringify({ option: 'Option 1' }),
        false
      );
      expect(response).toEqual({ option: 'Option 1' });
    });

    it('parses multiple selections response correctly', () => {
      const response = SelectColumnType.parseResponse(
        JSON.stringify({ options: ['Option 1', 'Option 2'] }),
        true
      );
      expect(response).toEqual({ options: ['Option 1', 'Option 2'] });
    });
  });
});
