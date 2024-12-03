import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectUserColumnType } from '../SelectUser';
import { GridCell } from '../../actions';
import { baseCell } from './test-types';

describe('SelectUserColumnType', () => {
  describe('renderCell', () => {
    it('renders single user correctly', () => {
      const cell: GridCell<"select-user"> = {
        ...baseCell,
        columnType: "select-user",
        state: "done",
        response: { 
          user: "octocat"
        },
        multiple: false
      };

      render(<>{SelectUserColumnType.renderCell(cell)}</>);
      expect(screen.getByText('octocat')).toBeInTheDocument();
      expect(screen.getByAltText('octocat')).toBeInTheDocument();
    });

    it('renders multiple users correctly', () => {
      const multipleCell: GridCell<"select-user"> = {
        ...baseCell,
        columnType: "select-user",
        state: "done",
        response: { 
          users: ["octocat", "github"]
        },
        multiple: true
      };

      render(<>{SelectUserColumnType.renderCell(multipleCell)}</>);
      expect(screen.getByText('octocat')).toBeInTheDocument();
      expect(screen.getByText('github')).toBeInTheDocument();
      expect(screen.getByAltText('octocat')).toBeInTheDocument();
      expect(screen.getByAltText('github')).toBeInTheDocument();
    });

    it('renders no selection message when empty', () => {
      const emptyCell: GridCell<"select-user"> = {
        ...baseCell,
        columnType: "select-user",
        state: "done",
        response: { users: [] },
        multiple: true
      };

      render(<>{SelectUserColumnType.renderCell(emptyCell)}</>);
      expect(screen.getByText('No users selected')).toBeInTheDocument();
    });
  });

  describe('generateResponseSchema', () => {
    it('returns correct schema for single selection', () => {
      const schema = SelectUserColumnType.generateResponseSchema(undefined, false);
      expect((schema as any).json_schema.schema.properties).toHaveProperty('user');
    });

    it('returns correct schema for multiple selection', () => {
      const schema = SelectUserColumnType.generateResponseSchema(undefined, true);
      expect((schema as any).json_schema.schema.properties).toHaveProperty('users');
    });
  });

  describe('parseResponse', () => {
    it('parses single user response correctly', () => {
      const response = SelectUserColumnType.parseResponse(
        JSON.stringify({
          user: "octocat"
        }),
        false
      );
      expect(response).toEqual({
        user: "octocat"
      });
    });

    it('parses multiple users response correctly', () => {
      const response = SelectUserColumnType.parseResponse(
        JSON.stringify({
          users: ["octocat"]
        }),
        true
      );
      expect(response).toEqual({
        users: ["octocat"]
      });
    });
  });
}); 