import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommitColumnType } from '../CommitColumnType';
import { GridCell } from '../../actions';

export const baseCell = {
  columnTitle: 'Test Column',
  columnInstructions: 'Test instructions',
  context: '',
  hydrationSources: [],
};

describe('CommitColumnType', () => {
  describe('renderCell', () => {
    it('renders single commit correctly', () => {
      const cell: GridCell<'commit'> = {
        ...baseCell,
        columnType: 'commit',
        state: 'done',
        response: {
          commit: {
            sha: 'abc123',
            message: 'Fix bug',
            repository: 'owner/repo',
          },
        },
        multiple: false,
      };

      render(<>{CommitColumnType.renderCell(cell)}</>);
      expect(screen.getByText(/abc123/)).toBeInTheDocument();
      expect(screen.getByText(/Fix bug/)).toBeInTheDocument();
    });

    it('renders multiple commits correctly', () => {
      const cell: GridCell<'commit'> = {
        ...baseCell,
        columnType: 'commit',
        state: 'done',
        response: {
          commits: [
            {
              sha: 'abc123',
              message: 'Fix bug',
              repository: 'owner/repo',
            },
            {
              sha: 'def456',
              message: 'Add feature',
              repository: 'owner/repo',
            },
          ],
        },
        multiple: true,
      };

      render(<>{CommitColumnType.renderCell(cell)}</>);
      expect(screen.getByText(/abc123/)).toBeInTheDocument();
      expect(screen.getByText(/Fix bug/)).toBeInTheDocument();
      expect(screen.getByText(/def456/)).toBeInTheDocument();
      expect(screen.getByText(/Add feature/)).toBeInTheDocument();
    });

    it('renders no selection message when empty', () => {
      const cell: GridCell<'commit'> = {
        ...baseCell,
        columnType: 'commit',
        state: 'done',
        response: { commits: [] },
        multiple: true,
      };

      render(<>{CommitColumnType.renderCell(cell)}</>);
      expect(screen.getByText('No commits selected')).toBeInTheDocument();
    });
  });

  describe('generateResponseSchema', () => {
    it('returns correct schema for single selection', () => {
      const schema = CommitColumnType.generateResponseSchema(undefined, false);
      if (schema?.type !== 'json_schema') throw new Error('Expected JSON schema');
      expect(schema.json_schema?.schema?.properties).toHaveProperty('commit');
    });

    it('returns correct schema for multiple selection', () => {
      const schema = CommitColumnType.generateResponseSchema(undefined, true);
      if (schema?.type !== 'json_schema') throw new Error('Expected JSON schema');
      expect(schema.json_schema?.schema?.properties).toHaveProperty('commits');
    });
  });

  describe('parseResponse', () => {
    it('parses single commit response correctly', () => {
      const response = CommitColumnType.parseResponse(
        JSON.stringify({
          commit: {
            sha: 'abc123',
            message: 'Fix bug',
            repository: 'owner/repo',
          },
        }),
        false
      );
      expect(response).toEqual({
        commit: {
          sha: 'abc123',
          message: 'Fix bug',
          repository: 'owner/repo',
        },
      });
    });

    it('parses multiple commits response correctly', () => {
      const response = CommitColumnType.parseResponse(
        JSON.stringify({
          commits: [
            {
              sha: 'abc123',
              message: 'Fix bug',
              repository: 'owner/repo',
            },
          ],
        }),
        true
      );
      expect(response).toEqual({
        commits: [
          {
            sha: 'abc123',
            message: 'Fix bug',
            repository: 'owner/repo',
          },
        ],
      });
    });
  });
});
