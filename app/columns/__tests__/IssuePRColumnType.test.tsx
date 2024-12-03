import React from 'react';
import { render, screen } from '@testing-library/react';
import { IssuePRColumnType } from '../IssuePRColumnType';
import { GridCell } from '../../actions';

describe('IssuePRColumnType', () => {
  const baseCell = {
    columnTitle: "Test Column",
    columnInstructions: "Test instructions",
    context: "",
    hydrationSources: [],
  };

  describe('renderCell', () => {
    it('renders single issue correctly', () => {
      const cell: GridCell<"issue-pr"> = {
        ...baseCell,
        columnType: "issue-pr",
        state: "done",
        response: {
          reference: {
            number: 123,
            repository: "owner/repo",
            type: "issue",
            title: "Test Issue"
          }
        },
        multiple: false
      };

      render(<>{IssuePRColumnType.renderCell(cell)}</>);
      expect(screen.getByText(/owner\/repo#123/)).toBeInTheDocument();
      expect(screen.getByText(/- Test Issue/)).toBeInTheDocument();
    });

    it('renders multiple PRs correctly', () => {
      const cell: GridCell<"issue-pr"> = {
        ...baseCell,
        columnType: "issue-pr",
        state: "done",
        response: {
          references: [
            {
              number: 123,
              repository: "owner/repo",
              type: "pull-request",
              title: "Test PR 1"
            },
            {
              number: 124,
              repository: "owner/repo",
              type: "pull-request",
              title: "Test PR 2"
            }
          ]
        },
        multiple: true
      };

      render(<>{IssuePRColumnType.renderCell(cell)}</>);
      expect(screen.getByText(/owner\/repo#123/)).toBeInTheDocument();
      expect(screen.getByText(/- Test PR 1/)).toBeInTheDocument();
      expect(screen.getByText(/owner\/repo#124/)).toBeInTheDocument();
      expect(screen.getByText(/- Test PR 2/)).toBeInTheDocument();
    });

    it('renders no selection message when empty', () => {
      const cell: GridCell<"issue-pr"> = {
        ...baseCell,
        columnType: "issue-pr",
        state: "done",
        response: { references: [] },
        multiple: true
      };

      render(<>{IssuePRColumnType.renderCell(cell)}</>);
      expect(screen.getByText('No issues/PRs selected')).toBeInTheDocument();
    });
  });

  describe('parseResponse', () => {
    it('parses single response correctly', () => {
      const response = IssuePRColumnType.parseResponse(
        JSON.stringify({
          reference: {
            number: 123,
            repository: "owner/repo",
            type: "issue"
          }
        }),
        false
      );
      expect(response).toEqual({
        reference: {
          number: 123,
          repository: "owner/repo",
          type: "issue"
        }
      });
    });

    it('parses multiple response correctly', () => {
      const response = IssuePRColumnType.parseResponse(
        JSON.stringify({
          references: [{
            number: 123,
            repository: "owner/repo",
            type: "issue"
          }]
        }),
        true
      );
      expect(response).toEqual({
        references: [{
          number: 123,
          repository: "owner/repo",
          type: "issue"
        }]
      });
    });
  });
}); 